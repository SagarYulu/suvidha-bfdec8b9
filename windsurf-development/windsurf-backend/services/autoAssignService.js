
const { pool } = require('../config/database');
const emailService = require('./emailService');
const realTimeService = require('./realTimeService');

class AutoAssignService {
  constructor() {
    this.assignmentRules = [
      { role: 'admin', priority: ['critical', 'high'], maxLoad: 10 },
      { role: 'manager', priority: ['high', 'medium'], maxLoad: 15 },
      { role: 'agent', priority: ['medium', 'low'], maxLoad: 20 }
    ];
  }

  async autoAssignIssue(issueId) {
    try {
      const [issueRows] = await pool.execute(
        'SELECT * FROM issues WHERE id = ?',
        [issueId]
      );

      if (issueRows.length === 0) {
        throw new Error('Issue not found');
      }

      const issue = issueRows[0];
      
      if (issue.assigned_to) {
        console.log(`Issue ${issueId} already assigned to ${issue.assigned_to}`);
        return null;
      }

      const assignee = await this.findBestAssignee(issue);
      
      if (assignee) {
        await this.assignIssueToUser(issueId, assignee.id);
        
        // Send notifications
        const [employeeRows] = await pool.execute(
          'SELECT * FROM employees WHERE id = ?',
          [issue.employee_uuid]
        );
        
        if (employeeRows.length > 0) {
          await emailService.sendAssignmentEmail(issue, assignee, employeeRows[0]);
        }
        
        realTimeService.notifyAssignment(issueId, assignee.id, 'system');
        
        console.log(`Issue ${issueId} auto-assigned to ${assignee.name}`);
        return assignee;
      }

      console.log(`No suitable assignee found for issue ${issueId}`);
      return null;
    } catch (error) {
      console.error('Auto assignment error:', error);
      throw error;
    }
  }

  async findBestAssignee(issue) {
    try {
      // Find users who can handle this priority level
      const suitableRoles = this.assignmentRules
        .filter(rule => rule.priority.includes(issue.priority))
        .map(rule => rule.role);

      if (suitableRoles.length === 0) {
        return null;
      }

      // Get available users with their current workload
      const [users] = await pool.execute(`
        SELECT 
          du.id, 
          du.name, 
          du.email, 
          du.role,
          COUNT(i.id) as current_load
        FROM dashboard_users du
        LEFT JOIN issues i ON i.assigned_to = du.id AND i.status NOT IN ('closed', 'resolved')
        WHERE du.role IN (${suitableRoles.map(() => '?').join(',')})
        GROUP BY du.id, du.name, du.email, du.role
        ORDER BY current_load ASC, RAND()
      `, suitableRoles);

      // Find user with lowest workload within limits
      for (const user of users) {
        const rule = this.assignmentRules.find(r => r.role === user.role);
        if (rule && user.current_load < rule.maxLoad) {
          return user;
        }
      }

      // If all users are at capacity, assign to the one with least load
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error finding best assignee:', error);
      throw error;
    }
  }

  async assignIssueToUser(issueId, userId) {
    try {
      const [result] = await pool.execute(
        'UPDATE issues SET assigned_to = ?, updated_at = NOW() WHERE id = ?',
        [userId, issueId]
      );

      // Log assignment in audit trail
      await pool.execute(`
        INSERT INTO issue_audit_trail (issue_id, employee_uuid, action, details)
        VALUES (?, ?, 'auto_assigned', JSON_OBJECT('assigned_to', ?))
      `, [issueId, 'system', userId]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error assigning issue to user:', error);
      throw error;
    }
  }

  async escalateOverdueIssues() {
    try {
      // Find issues that are overdue (more than 48 hours without update)
      const [overdueIssues] = await pool.execute(`
        SELECT * FROM issues 
        WHERE status NOT IN ('closed', 'resolved') 
        AND updated_at < DATE_SUB(NOW(), INTERVAL 48 HOUR)
        AND priority != 'critical'
      `);

      for (const issue of overdueIssues) {
        await this.escalateIssue(issue);
      }

      console.log(`Escalated ${overdueIssues.length} overdue issues`);
      return overdueIssues.length;
    } catch (error) {
      console.error('Error escalating overdue issues:', error);
      throw error;
    }
  }

  async escalateIssue(issue) {
    try {
      const priorityEscalation = {
        'low': 'medium',
        'medium': 'high',
        'high': 'critical'
      };

      const newPriority = priorityEscalation[issue.priority] || issue.priority;
      
      if (newPriority !== issue.priority) {
        await pool.execute(
          'UPDATE issues SET priority = ?, updated_at = NOW() WHERE id = ?',
          [newPriority, issue.id]
        );

        // Log escalation
        await pool.execute(`
          INSERT INTO issue_audit_trail (issue_id, employee_uuid, action, previous_status, new_status, details)
          VALUES (?, ?, 'escalated', ?, ?, JSON_OBJECT('reason', 'overdue'))
        `, [issue.id, 'system', issue.priority, newPriority]);

        // Notify about escalation
        realTimeService.notifyIssueUpdate(issue.id, 'issue_escalated', {
          oldPriority: issue.priority,
          newPriority: newPriority,
          reason: 'overdue'
        });

        console.log(`Issue ${issue.id} escalated from ${issue.priority} to ${newPriority}`);
      }
    } catch (error) {
      console.error('Error escalating individual issue:', error);
      throw error;
    }
  }

  async getAssignmentStats() {
    try {
      const [stats] = await pool.execute(`
        SELECT 
          du.role,
          COUNT(i.id) as assigned_count,
          AVG(DATEDIFF(NOW(), i.created_at)) as avg_age_days
        FROM dashboard_users du
        LEFT JOIN issues i ON i.assigned_to = du.id AND i.status NOT IN ('closed', 'resolved')
        GROUP BY du.role
      `);

      return stats;
    } catch (error) {
      console.error('Error getting assignment stats:', error);
      throw error;
    }
  }
}

module.exports = new AutoAssignService();
