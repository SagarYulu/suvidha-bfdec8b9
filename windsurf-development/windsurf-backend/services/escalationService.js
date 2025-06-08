
const { pool } = require('../config/database');
const emailService = require('./actualEmailService');
const auditController = require('../controllers/auditController');
const autoAssignService = require('./autoAssignService');

class EscalationService {
  constructor() {
    this.escalationThresholds = {
      'low': { hours: 48, escalateTo: 'agent' },
      'medium': { hours: 24, escalateTo: 'manager' },
      'high': { hours: 12, escalateTo: 'manager' },
      'critical': { hours: 4, escalateTo: 'admin' }
    };
  }

  async checkAndEscalateIssues() {
    try {
      console.log('Starting escalation check...');

      // Get all open issues that might need escalation
      const [issues] = await pool.execute(`
        SELECT 
          i.*,
          e.name as employee_name,
          e.email as employee_email,
          e.city,
          e.cluster,
          TIMESTAMPDIFF(HOUR, i.created_at, NOW()) as age_hours,
          TIMESTAMPDIFF(HOUR, COALESCE(i.escalated_at, i.created_at), NOW()) as escalation_age_hours
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE i.status NOT IN ('closed', 'resolved')
        ORDER BY i.priority DESC, i.created_at ASC
      `);

      let escalatedCount = 0;

      for (const issue of issues) {
        const shouldEscalate = await this.shouldEscalateIssue(issue);
        
        if (shouldEscalate) {
          const result = await this.escalateIssue(issue.id, {
            reason: 'time_threshold_exceeded',
            escalatedBy: 'system'
          });

          if (result.success) {
            escalatedCount++;
          }
        }
      }

      console.log(`Escalation check completed. ${escalatedCount} issues escalated.`);
      return escalatedCount;

    } catch (error) {
      console.error('Error checking escalations:', error);
      throw error;
    }
  }

  async shouldEscalateIssue(issue) {
    try {
      const threshold = this.escalationThresholds[issue.priority];
      if (!threshold) return false;

      const ageHours = parseFloat(issue.age_hours);
      const escalationAgeHours = parseFloat(issue.escalation_age_hours);

      // Don't escalate if already escalated recently (within 6 hours)
      if (issue.escalated_at && escalationAgeHours < 6) {
        return false;
      }

      // Check if issue is old enough for initial escalation
      if (!issue.escalated_at && ageHours >= threshold.hours) {
        return true;
      }

      // Check for further escalation (every 24 hours after first escalation)
      if (issue.escalated_at && escalationAgeHours >= 24 && issue.escalation_level < 3) {
        return true;
      }

      return false;

    } catch (error) {
      console.error('Error checking if issue should escalate:', error);
      return false;
    }
  }

  async escalateIssue(issueId, options = {}) {
    try {
      const { reason = 'manual', escalatedBy = 'system', priority, escalateTo } = options;

      // Get current issue details
      const [issues] = await pool.execute(`
        SELECT i.*, e.name as employee_name, e.email as employee_email
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE i.id = ?
      `, [issueId]);

      if (issues.length === 0) {
        return { success: false, error: 'Issue not found' };
      }

      const issue = issues[0];
      const currentLevel = issue.escalation_level || 0;
      const newLevel = Math.min(currentLevel + 1, 3); // Max escalation level is 3

      // Update issue priority if specified
      let newPriority = issue.priority;
      if (priority) {
        newPriority = priority;
      } else if (reason === 'time_threshold_exceeded') {
        // Auto-escalate priority
        const priorityEscalation = {
          'low': 'medium',
          'medium': 'high',
          'high': 'critical'
        };
        newPriority = priorityEscalation[issue.priority] || issue.priority;
      }

      // Update issue in database
      await pool.execute(`
        UPDATE issues 
        SET 
          escalated_at = NOW(),
          escalation_level = ?,
          escalation_count = escalation_count + 1,
          priority = ?,
          updated_at = NOW()
        WHERE id = ?
      `, [newLevel, newPriority, issueId]);

      // Log escalation in audit trail
      await auditController.logAction(
        'escalated',
        issueId,
        escalatedBy,
        {
          reason,
          previous_level: currentLevel,
          new_level: newLevel,
          previous_priority: issue.priority,
          new_priority: newPriority,
          escalate_to: escalateTo
        },
        issue.priority,
        newPriority
      );

      // Find and notify escalation recipient
      await this.notifyEscalation(issueId, issue, newLevel, reason);

      // Try to reassign if specified or if currently unassigned
      if (escalateTo || !issue.assigned_to) {
        try {
          const assignee = await this.findEscalationAssignee(issue, escalateTo, newLevel);
          if (assignee) {
            await pool.execute(`
              UPDATE issues SET assigned_to = ? WHERE id = ?
            `, [assignee.id, issueId]);

            await auditController.logAction(
              'escalation_reassigned',
              issueId,
              escalatedBy,
              {
                assigned_to: assignee.id,
                assignee_name: assignee.name,
                escalation_level: newLevel
              }
            );
          }
        } catch (assignError) {
          console.error('Failed to reassign escalated issue:', assignError);
        }
      }

      // Get updated issue
      const [updatedIssues] = await pool.execute(`
        SELECT i.*, e.name as employee_name
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE i.id = ?
      `, [issueId]);

      console.log(`Issue ${issueId} escalated to level ${newLevel} (${reason})`);

      return { 
        success: true, 
        issue: updatedIssues[0],
        escalation_level: newLevel,
        previous_level: currentLevel
      };

    } catch (error) {
      console.error('Error escalating issue:', error);
      return { success: false, error: error.message };
    }
  }

  async findEscalationAssignee(issue, escalateTo, escalationLevel) {
    try {
      let targetRoles = [];

      if (escalateTo) {
        targetRoles = [escalateTo];
      } else {
        // Determine target roles based on escalation level
        switch (escalationLevel) {
          case 1:
            targetRoles = ['agent', 'manager'];
            break;
          case 2:
            targetRoles = ['manager', 'admin'];
            break;
          case 3:
            targetRoles = ['admin'];
            break;
          default:
            targetRoles = ['agent'];
        }
      }

      const roleFilter = targetRoles.map(() => '?').join(',');

      const [assignees] = await pool.execute(`
        SELECT 
          du.id,
          du.name,
          du.email,
          du.role,
          COUNT(i.id) as current_load
        FROM dashboard_users du
        LEFT JOIN issues i ON i.assigned_to = du.id 
          AND i.status NOT IN ('closed', 'resolved')
        WHERE du.role IN (${roleFilter})
        GROUP BY du.id, du.name, du.email, du.role
        ORDER BY 
          CASE du.role 
            WHEN 'admin' THEN 1 
            WHEN 'manager' THEN 2 
            ELSE 3 
          END,
          current_load ASC,
          RAND()
        LIMIT 1
      `, targetRoles);

      return assignees.length > 0 ? assignees[0] : null;

    } catch (error) {
      console.error('Error finding escalation assignee:', error);
      return null;
    }
  }

  async notifyEscalation(issueId, issue, escalationLevel, reason) {
    try {
      // Get escalation notification recipients
      const [recipients] = await pool.execute(`
        SELECT du.email, du.name, du.role
        FROM dashboard_users du
        WHERE du.role IN ('admin', 'manager')
        ORDER BY 
          CASE du.role 
            WHEN 'admin' THEN 1 
            WHEN 'manager' THEN 2 
            ELSE 3 
          END
      `);

      // Send email to escalation recipients
      for (const recipient of recipients) {
        try {
          await emailService.sendEscalationEmail(
            recipient.email,
            recipient.name,
            {
              ...issue,
              id: issueId,
              escalation_level: escalationLevel,
              escalation_reason: reason
            }
          );
        } catch (emailError) {
          console.error(`Failed to send escalation email to ${recipient.email}:`, emailError);
        }
      }

      // Notify issue owner
      if (issue.employee_email) {
        try {
          await emailService.sendIssueStatusUpdateEmail(
            issue.employee_email,
            issue.employee_name,
            { ...issue, id: issueId },
            issue.status,
            `escalated_level_${escalationLevel}`
          );
        } catch (emailError) {
          console.error(`Failed to send escalation notice to issue owner:`, emailError);
        }
      }

    } catch (error) {
      console.error('Error sending escalation notifications:', error);
    }
  }

  async getEscalationMetrics(filters = {}) {
    try {
      const { startDate, endDate, city, cluster } = filters;

      let whereClause = 'WHERE i.escalated_at IS NOT NULL';
      const params = [];

      if (startDate) {
        whereClause += ' AND i.escalated_at >= ?';
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND i.escalated_at <= ?';
        params.push(endDate);
      }

      if (city) {
        whereClause += ' AND e.city = ?';
        params.push(city);
      }

      if (cluster) {
        whereClause += ' AND e.cluster = ?';
        params.push(cluster);
      }

      const [metrics] = await pool.execute(`
        SELECT 
          COUNT(*) as total_escalations,
          COUNT(CASE WHEN i.status IN ('resolved', 'closed') THEN 1 END) as resolved_escalations,
          AVG(i.escalation_level) as avg_escalation_level,
          COUNT(CASE WHEN i.escalation_level = 1 THEN 1 END) as level_1_escalations,
          COUNT(CASE WHEN i.escalation_level = 2 THEN 1 END) as level_2_escalations,
          COUNT(CASE WHEN i.escalation_level = 3 THEN 1 END) as level_3_escalations,
          AVG(TIMESTAMPDIFF(HOUR, i.escalated_at, COALESCE(i.closed_at, NOW()))) as avg_resolution_hours
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        ${whereClause}
      `, params);

      return metrics[0];

    } catch (error) {
      console.error('Error getting escalation metrics:', error);
      throw error;
    }
  }

  async updateEscalationThresholds(priority, hours, escalateTo) {
    try {
      this.escalationThresholds[priority] = { hours, escalateTo };
      console.log(`Escalation threshold updated for ${priority}: ${hours} hours -> ${escalateTo}`);
    } catch (error) {
      console.error('Error updating escalation thresholds:', error);
      throw error;
    }
  }
}

module.exports = new EscalationService();
