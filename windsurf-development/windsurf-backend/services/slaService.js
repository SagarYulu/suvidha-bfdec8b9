
const db = require('../config/database');
const notificationService = require('./notificationService');
const emailService = require('./emailService');

class SLAService {
  constructor() {
    // SLA thresholds in hours
    this.slaThresholds = {
      'urgent': { response: 1, resolution: 4 },
      'high': { response: 4, resolution: 24 },
      'medium': { response: 8, resolution: 72 },
      'low': { response: 24, resolution: 168 }
    };
  }

  async checkSLAViolations() {
    console.log('Checking SLA violations...');
    
    const [openIssues] = await db.execute(`
      SELECT i.*, e.name as employee_name, e.email as employee_email,
             au.name as assigned_user_name, au.email as assigned_user_email
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      LEFT JOIN dashboard_users au ON i.assigned_to = au.id
      WHERE i.status IN ('open', 'in_progress')
    `);

    for (const issue of openIssues) {
      await this.checkIssueViolation(issue);
    }
  }

  async checkIssueViolation(issue) {
    const priority = issue.priority || 'medium';
    const thresholds = this.slaThresholds[priority];
    
    if (!thresholds) return;

    const createdAt = new Date(issue.created_at);
    const now = new Date();
    const hoursElapsed = (now - createdAt) / (1000 * 60 * 60);

    // Check response time violation
    if (!issue.first_response_at && hoursElapsed > thresholds.response) {
      await this.handleResponseViolation(issue, hoursElapsed, thresholds.response);
    }

    // Check resolution time violation
    if (hoursElapsed > thresholds.resolution) {
      await this.handleResolutionViolation(issue, hoursElapsed, thresholds.resolution);
    }
  }

  async handleResponseViolation(issue, elapsed, threshold) {
    console.log(`Response SLA violation for issue ${issue.id}: ${elapsed.toFixed(1)}h > ${threshold}h`);
    
    // Mark as SLA violated
    await db.execute(`
      UPDATE issues 
      SET sla_violated = true, sla_violation_type = 'response'
      WHERE id = ?
    `, [issue.id]);

    // Notify assigned user
    if (issue.assigned_to) {
      await notificationService.createNotification({
        userId: issue.assigned_to,
        title: 'SLA Violation - Response Time',
        message: `Issue #${issue.id} has exceeded response time SLA (${threshold}h)`,
        type: 'warning',
        relatedEntityType: 'issue',
        relatedEntityId: issue.id
      });

      if (issue.assigned_user_email) {
        await emailService.sendSLAViolationEmail(
          issue.assigned_user_email,
          issue.assigned_user_name,
          issue.id,
          'response',
          threshold
        );
      }
    }

    // Auto-escalate if needed
    await this.escalateIssue(issue.id, 'response_sla_violation');
  }

  async handleResolutionViolation(issue, elapsed, threshold) {
    console.log(`Resolution SLA violation for issue ${issue.id}: ${elapsed.toFixed(1)}h > ${threshold}h`);
    
    // Mark as SLA violated
    await db.execute(`
      UPDATE issues 
      SET sla_violated = true, sla_violation_type = 'resolution'
      WHERE id = ?
    `, [issue.id]);

    // Escalate to manager or senior role
    await this.escalateIssue(issue.id, 'resolution_sla_violation');
  }

  async escalateIssue(issueId, reason) {
    // Get senior users who can handle escalations
    const [seniors] = await db.execute(`
      SELECT id, name, email 
      FROM dashboard_users 
      WHERE role IN ('admin', 'manager') 
      AND status = 'active'
      ORDER BY RAND() 
      LIMIT 1
    `);

    if (seniors.length > 0) {
      const senior = seniors[0];
      
      // Assign to senior user
      await db.execute(`
        UPDATE issues 
        SET assigned_to = ?, escalated = true, escalation_reason = ?
        WHERE id = ?
      `, [senior.id, reason, issueId]);

      // Notify about escalation
      await notificationService.createNotification({
        userId: senior.id,
        title: 'Issue Escalated',
        message: `Issue #${issueId} has been escalated due to ${reason}`,
        type: 'warning',
        relatedEntityType: 'issue',
        relatedEntityId: issueId
      });

      console.log(`Issue ${issueId} escalated to ${senior.name} due to ${reason}`);
    }
  }

  async getSLAMetrics() {
    const [metrics] = await db.execute(`
      SELECT 
        priority,
        COUNT(*) as total_issues,
        SUM(CASE WHEN sla_violated = true THEN 1 ELSE 0 END) as violated_issues,
        AVG(CASE WHEN status = 'closed' 
            THEN TIMESTAMPDIFF(HOUR, created_at, closed_at) 
            ELSE NULL END) as avg_resolution_time,
        AVG(CASE WHEN first_response_at IS NOT NULL 
            THEN TIMESTAMPDIFF(HOUR, created_at, first_response_at) 
            ELSE NULL END) as avg_response_time
      FROM issues 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY priority
    `);

    return metrics;
  }

  startSLAMonitoring() {
    // Check SLA violations every 30 minutes
    setInterval(() => {
      this.checkSLAViolations().catch(console.error);
    }, 30 * 60 * 1000);

    console.log('SLA monitoring started');
  }
}

module.exports = new SLAService();
