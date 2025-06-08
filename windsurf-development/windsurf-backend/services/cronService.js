
const cron = require('node-cron');
const escalationService = require('./escalationService');
const autoAssignService = require('./autoAssignService');
const slaService = require('./slaService');

class CronService {
  constructor() {
    this.jobs = [];
  }

  startAllJobs() {
    console.log('Starting cron jobs...');

    // Check for escalations every 15 minutes
    const escalationJob = cron.schedule('*/15 * * * *', async () => {
      try {
        console.log('Running escalation check...');
        const escalatedCount = await escalationService.checkAndEscalateIssues();
        console.log(`Escalation check completed: ${escalatedCount} issues escalated`);
      } catch (error) {
        console.error('Escalation cron job error:', error);
      }
    }, {
      scheduled: false
    });

    // Check for SLA breaches every hour
    const slaJob = cron.schedule('0 * * * *', async () => {
      try {
        console.log('Running SLA breach check...');
        const result = await slaService.checkSLABreaches();
        console.log(`SLA check completed: ${result.breached} breaches detected`);
      } catch (error) {
        console.error('SLA cron job error:', error);
      }
    }, {
      scheduled: false
    });

    // Rebalance workload every 6 hours
    const rebalanceJob = cron.schedule('0 */6 * * *', async () => {
      try {
        console.log('Running workload rebalancing...');
        const rebalancedCount = await autoAssignService.rebalanceWorkload();
        console.log(`Workload rebalancing completed: ${rebalancedCount} issues reassigned`);
      } catch (error) {
        console.error('Rebalance cron job error:', error);
      }
    }, {
      scheduled: false
    });

    // Health check and cleanup every day at 2 AM
    const cleanupJob = cron.schedule('0 2 * * *', async () => {
      try {
        console.log('Running daily cleanup...');
        await this.dailyCleanup();
        console.log('Daily cleanup completed');
      } catch (error) {
        console.error('Cleanup cron job error:', error);
      }
    }, {
      scheduled: false
    });

    this.jobs = [
      { name: 'escalation', job: escalationJob },
      { name: 'sla', job: slaJob },
      { name: 'rebalance', job: rebalanceJob },
      { name: 'cleanup', job: cleanupJob }
    ];

    // Start all jobs
    this.jobs.forEach(({ name, job }) => {
      job.start();
      console.log(`✅ ${name} cron job started`);
    });
  }

  stopAllJobs() {
    console.log('Stopping cron jobs...');
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      console.log(`❌ ${name} cron job stopped`);
    });
  }

  async dailyCleanup() {
    const { pool } = require('../config/database');
    
    try {
      // Clean up old audit trail entries (older than 6 months)
      const [auditResult] = await pool.execute(`
        DELETE FROM issue_audit_trail 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH)
      `);
      
      console.log(`Cleaned up ${auditResult.affectedRows} old audit trail entries`);

      // Clean up old notifications (older than 3 months)
      const [notifResult] = await pool.execute(`
        DELETE FROM issue_notifications 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH)
      `);
      
      console.log(`Cleaned up ${notifResult.affectedRows} old notifications`);

      // Update statistics
      await this.updateSystemStats();

    } catch (error) {
      console.error('Daily cleanup error:', error);
      throw error;
    }
  }

  async updateSystemStats() {
    const { pool } = require('../config/database');
    
    try {
      // This could be expanded to update cached statistics tables
      console.log('System statistics updated');
    } catch (error) {
      console.error('Update stats error:', error);
    }
  }

  getJobStatus() {
    return this.jobs.map(({ name, job }) => ({
      name,
      running: job.running || false
    }));
  }
}

module.exports = new CronService();
