
const { pool } = require('../config/database');
const emailService = require('./emailService');

class SLAService {
  constructor() {
    this.SLA_THRESHOLD_HOURS = 48; // 48-hour SLA breach threshold
    this.BUSINESS_HOURS_START = 9; // 9 AM
    this.BUSINESS_HOURS_END = 17; // 5 PM
    this.WORKING_DAYS = [1, 2, 3, 4, 5, 6]; // Monday to Saturday
  }

  /**
   * Calculate business hours between two dates
   */
  calculateBusinessHours(startDate, endDate) {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    let totalHours = 0;
    
    // Clone start date to avoid mutation
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      
      // Check if it's a working day (Monday=1, Saturday=6)
      if (this.WORKING_DAYS.includes(dayOfWeek)) {
        const dayStart = new Date(current);
        dayStart.setHours(this.BUSINESS_HOURS_START, 0, 0, 0);
        
        const dayEnd = new Date(current);
        dayEnd.setHours(this.BUSINESS_HOURS_END, 0, 0, 0);
        
        // Calculate overlap with business hours
        const effectiveStart = new Date(Math.max(start.getTime(), dayStart.getTime()));
        const effectiveEnd = new Date(Math.min(end.getTime(), dayEnd.getTime()));
        
        if (effectiveStart < effectiveEnd) {
          totalHours += (effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60);
        }
      }
      
      // Move to next day
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
    }
    
    return Math.round(totalHours * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Check for SLA breaches and send alerts
   */
  async checkSLABreaches() {
    try {
      console.log('Checking for SLA breaches...');
      
      const [openIssues] = await pool.execute(`
        SELECT 
          i.id,
          i.description,
          i.priority,
          i.status,
          i.created_at,
          i.assigned_to,
          i.employee_uuid,
          e.name as employee_name,
          e.email as employee_email
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE i.status IN ('open', 'in_progress')
        AND i.created_at <= DATE_SUB(NOW(), INTERVAL ? HOUR)
      `, [this.SLA_THRESHOLD_HOURS]);

      console.log(`Found ${openIssues.length} potential SLA breach issues`);

      for (const issue of openIssues) {
        const businessHours = this.calculateBusinessHours(issue.created_at, new Date());
        
        if (businessHours >= this.SLA_THRESHOLD_HOURS) {
          await this.handleSLABreach(issue, businessHours);
        }
      }

      return {
        checked: openIssues.length,
        breached: openIssues.filter(issue => 
          this.calculateBusinessHours(issue.created_at, new Date()) >= this.SLA_THRESHOLD_HOURS
        ).length
      };
    } catch (error) {
      console.error('Error checking SLA breaches:', error);
      throw error;
    }
  }

  /**
   * Handle SLA breach notification and escalation
   */
  async handleSLABreach(issue, businessHours) {
    try {
      console.log(`SLA breach detected for issue ${issue.id}: ${businessHours} hours`);

      // Mark issue as SLA breached (if not already marked)
      await pool.execute(`
        UPDATE issues 
        SET priority = CASE 
          WHEN priority = 'low' THEN 'medium'
          WHEN priority = 'medium' THEN 'high'
          WHEN priority = 'high' THEN 'critical'
          ELSE priority
        END
        WHERE id = ? AND priority != 'critical'
      `, [issue.id]);

      // Log SLA breach in audit trail
      await pool.execute(`
        INSERT INTO issue_audit_trail (
          issue_id, employee_uuid, action, details
        ) VALUES (?, ?, ?, ?)
      `, [
        issue.id,
        'system',
        'sla_breach_detected',
        JSON.stringify({
          business_hours: businessHours,
          threshold_hours: this.SLA_THRESHOLD_HOURS,
          escalated_priority: true
        })
      ]);

      // Send SLA breach notification
      await this.sendSLABreachNotification(issue, businessHours);

      // Auto-assign if not assigned
      if (!issue.assigned_to) {
        await this.autoAssignIssue(issue);
      }

    } catch (error) {
      console.error(`Error handling SLA breach for issue ${issue.id}:`, error);
    }
  }

  /**
   * Auto-assign issue to least busy available agent
   */
  async autoAssignIssue(issue) {
    try {
      // Find least busy agent (with admin or employee role)
      const [availableAgents] = await pool.execute(`
        SELECT 
          e.id,
          e.name,
          e.email,
          COUNT(i.id) as active_issues
        FROM employees e
        LEFT JOIN issues i ON e.id = i.assigned_to 
          AND i.status IN ('open', 'in_progress')
        WHERE e.role IN ('admin', 'employee')
        GROUP BY e.id, e.name, e.email
        ORDER BY active_issues ASC, e.name ASC
        LIMIT 1
      `);

      if (availableAgents.length > 0) {
        const agent = availableAgents[0];
        
        // Assign issue to agent
        await pool.execute(`
          UPDATE issues 
          SET assigned_to = ?, updated_at = NOW()
          WHERE id = ?
        `, [agent.id, issue.id]);

        // Log assignment in audit trail
        await pool.execute(`
          INSERT INTO issue_audit_trail (
            issue_id, employee_uuid, action, details
          ) VALUES (?, ?, ?, ?)
        `, [
          issue.id,
          'system',
          'auto_assigned',
          JSON.stringify({
            assigned_to: agent.id,
            agent_name: agent.name,
            reason: 'sla_breach_auto_assignment',
            previous_active_issues: agent.active_issues
          })
        ]);

        console.log(`Auto-assigned issue ${issue.id} to ${agent.name} (${agent.active_issues} active issues)`);

        // Send assignment notification
        await emailService.sendAssignmentNotification(issue.id, agent.id);
      }
    } catch (error) {
      console.error(`Error auto-assigning issue ${issue.id}:`, error);
    }
  }

  /**
   * Send SLA breach notification to relevant parties
   */
  async sendSLABreachNotification(issue, businessHours) {
    try {
      // Get admin users for escalation
      const [adminUsers] = await pool.execute(`
        SELECT email, name FROM employees 
        WHERE role IN ('admin', 'manager')
      `);

      const emailData = {
        issueId: issue.id,
        description: issue.description,
        priority: issue.priority,
        businessHours: businessHours,
        thresholdHours: this.SLA_THRESHOLD_HOURS,
        employeeName: issue.employee_name,
        employeeEmail: issue.employee_email
      };

      // Send to admins
      for (const admin of adminUsers) {
        await emailService.sendSLABreachAlert(admin.email, emailData);
      }

      // Send to assigned agent if exists
      if (issue.assigned_to) {
        const [assignedAgent] = await pool.execute(`
          SELECT email, name FROM employees WHERE id = ?
        `, [issue.assigned_to]);

        if (assignedAgent.length > 0) {
          await emailService.sendSLABreachAlert(assignedAgent[0].email, emailData);
        }
      }

    } catch (error) {
      console.error('Error sending SLA breach notification:', error);
    }
  }

  /**
   * Get SLA performance metrics
   */
  async getSLAMetrics(filters = {}) {
    try {
      const { startDate, endDate, priority, status } = filters;
      
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (startDate) {
        whereClause += ' AND i.created_at >= ?';
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND i.created_at <= ?';
        params.push(endDate);
      }

      if (priority) {
        whereClause += ' AND i.priority = ?';
        params.push(priority);
      }

      if (status) {
        whereClause += ' AND i.status = ?';
        params.push(status);
      }

      const [metrics] = await pool.execute(`
        SELECT 
          COUNT(*) as total_issues,
          COUNT(CASE WHEN i.status IN ('resolved', 'closed') THEN 1 END) as resolved_issues,
          COUNT(CASE WHEN 
            TIMESTAMPDIFF(HOUR, i.created_at, COALESCE(i.closed_at, NOW())) >= ?
          THEN 1 END) as sla_breached,
          AVG(CASE WHEN i.closed_at IS NOT NULL THEN
            TIMESTAMPDIFF(HOUR, i.created_at, i.closed_at)
          END) as avg_resolution_time_hours
        FROM issues i
        ${whereClause}
      `, [this.SLA_THRESHOLD_HOURS, ...params]);

      const result = metrics[0];
      const slaCompliance = result.total_issues > 0 
        ? ((result.total_issues - result.sla_breached) / result.total_issues * 100)
        : 100;

      return {
        totalIssues: result.total_issues,
        resolvedIssues: result.resolved_issues,
        slaBreached: result.sla_breached,
        slaCompliance: Math.round(slaCompliance * 100) / 100,
        avgResolutionTimeHours: Math.round((result.avg_resolution_time_hours || 0) * 100) / 100,
        thresholdHours: this.SLA_THRESHOLD_HOURS
      };
    } catch (error) {
      console.error('Error getting SLA metrics:', error);
      throw error;
    }
  }
}

module.exports = new SLAService();
