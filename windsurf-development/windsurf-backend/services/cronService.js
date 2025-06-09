
const cron = require('node-cron');
const { pool } = require('../config/database');
const emailService = require('./emailService');

class CronService {
  constructor() {
    this.jobs = [];
  }

  startAllJobs() {
    // Check for SLA breaches every hour
    const slaCheckJob = cron.schedule('0 * * * *', async () => {
      await this.checkSLABreaches();
    }, { scheduled: false });

    // Auto-escalate issues daily at 9 AM
    const escalationJob = cron.schedule('0 9 * * *', async () => {
      await this.autoEscalateIssues();
    }, { scheduled: false });

    // Cleanup old audit logs monthly
    const cleanupJob = cron.schedule('0 0 1 * *', async () => {
      await this.cleanupOldAuditLogs();
    }, { scheduled: false });

    this.jobs.push(
      { name: 'sla-check', job: slaCheckJob },
      { name: 'auto-escalation', job: escalationJob },
      { name: 'audit-cleanup', job: cleanupJob }
    );

    // Start all jobs
    this.jobs.forEach(({ name, job }) => {
      job.start();
      console.log(`✅ Cron job '${name}' started`);
    });
  }

  stopAllJobs() {
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      console.log(`🛑 Cron job '${name}' stopped`);
    });
  }

  async checkSLABreaches() {
    try {
      console.log('🔍 Running SLA breach check...');
      
      const [breachedIssues] = await pool.execute(`
        SELECT i.*, e.name as employee_name, e.email as employee_email,
               DATEDIFF(NOW(), i.created_at) as days_open
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.emp_id
        WHERE i.status != 'closed' 
        AND DATEDIFF(NOW(), i.created_at) > 14
        AND i.escalated_at IS NULL
      `);

      console.log(`📊 Found ${breachedIssues.length} SLA breaches`);

      for (const issue of breachedIssues) {
        // Mark as escalated
        await pool.execute(
          'UPDATE issues SET escalated_at = NOW() WHERE id = ?',
          [issue.id]
        );

        // Find manager for escalation
        const [managers] = await pool.execute(`
          SELECT * FROM dashboard_users 
          WHERE role IN ('manager', 'admin') 
          AND (city = ? OR cluster = ?)
          LIMIT 1
        `, [issue.city, issue.cluster]);

        if (managers.length > 0) {
          await emailService.sendEscalationNotification(
            issue, 
            managers[0], 
            { name: issue.employee_name, email: issue.employee_email }
          );
        }
      }
    } catch (error) {
      console.error('❌ SLA breach check failed:', error);
    }
  }

  async autoEscalateIssues() {
    try {
      console.log('⚡ Running auto-escalation...');
      
      const [oldIssues] = await pool.execute(`
        SELECT i.*, e.name as employee_name, e.email as employee_email
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.emp_id
        WHERE i.status = 'open' 
        AND DATEDIFF(NOW(), i.created_at) > 30
        AND i.escalated_at IS NULL
      `);

      console.log(`📈 Auto-escalating ${oldIssues.length} issues`);

      for (const issue of oldIssues) {
        await pool.execute(
          'UPDATE issues SET status = "escalated", escalated_at = NOW() WHERE id = ?',
          [issue.id]
        );

        // Create audit trail
        await pool.execute(`
          INSERT INTO issue_audit_trail (
            issue_id, employee_uuid, action, previous_status, new_status, details
          ) VALUES (?, ?, 'auto_escalate', 'open', 'escalated', ?)
        `, [
          issue.id,
          'system',
          JSON.stringify({ reason: 'auto_escalation_30_days' })
        ]);
      }
    } catch (error) {
      console.error('❌ Auto-escalation failed:', error);
    }
  }

  async cleanupOldAuditLogs() {
    try {
      console.log('🧹 Cleaning up old audit logs...');
      
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - 12);

      const [result1] = await pool.execute(
        'DELETE FROM issue_audit_trail WHERE created_at < ?',
        [cutoffDate]
      );

      const [result2] = await pool.execute(
        'DELETE FROM dashboard_user_audit_logs WHERE performed_at < ?',
        [cutoffDate]
      );

      console.log(`🗑️ Deleted ${result1.affectedRows} issue audit logs and ${result2.affectedRows} user audit logs`);
    } catch (error) {
      console.error('❌ Audit log cleanup failed:', error);
    }
  }
}

module.exports = new CronService();
