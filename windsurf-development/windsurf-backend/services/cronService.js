
const cron = require('node-cron');
const TATService = require('./tatService');
const EscalationService = require('./escalationService');
const NotificationService = require('./notificationService');
const EmailService = require('./emailService');

class CronService {
  static jobs = {};

  static init() {
    console.log('Initializing cron jobs...');
    
    // Check for TAT violations every hour
    this.scheduleJob('tatCheck', '0 * * * *', this.checkTATViolations.bind(this));
    
    // Auto-escalate issues every 6 hours
    this.scheduleJob('autoEscalation', '0 */6 * * *', this.processAutoEscalations.bind(this));
    
    // Cleanup old notifications daily at 2 AM
    this.scheduleJob('cleanupNotifications', '0 2 * * *', this.cleanupOldNotifications.bind(this));
    
    // Generate daily reports at 8 AM
    this.scheduleJob('dailyReports', '0 8 * * *', this.generateDailyReports.bind(this));
    
    // Health check every 5 minutes
    this.scheduleJob('healthCheck', '*/5 * * * *', this.performHealthCheck.bind(this));

    console.log('Cron jobs initialized successfully');
  }

  static scheduleJob(name, schedule, task) {
    try {
      this.jobs[name] = cron.schedule(schedule, task, {
        scheduled: true,
        timezone: 'Asia/Kolkata' // Adjust timezone as needed
      });
      console.log(`Scheduled job '${name}' with pattern '${schedule}'`);
    } catch (error) {
      console.error(`Failed to schedule job '${name}':`, error);
    }
  }

  static async checkTATViolations() {
    try {
      console.log('Running TAT violations check...');
      
      const escalationsNeeded = await TATService.checkForEscalations();
      
      if (escalationsNeeded.length > 0) {
        console.log(`Found ${escalationsNeeded.length} issues needing TAT escalation`);
        
        for (const escalation of escalationsNeeded) {
          try {
            // Send TAT warning notifications
            await NotificationService.notifyTATWarning(
              escalation.issue, 
              escalation.tat
            );
          } catch (error) {
            console.error(`Failed to send TAT warning for issue ${escalation.issue.id}:`, error);
          }
        }
      }
      
      console.log('TAT violations check completed');
    } catch (error) {
      console.error('Error in TAT violations check:', error);
    }
  }

  static async processAutoEscalations() {
    try {
      console.log('Processing auto-escalations...');
      
      const escalations = await EscalationService.checkAndProcessAutoEscalations();
      
      if (escalations.length > 0) {
        console.log(`Created ${escalations.length} auto-escalations`);
        
        // Send summary email to administrators
        await this.sendEscalationSummary(escalations);
      }
      
      console.log('Auto-escalation processing completed');
    } catch (error) {
      console.error('Error in auto-escalation processing:', error);
    }
  }

  static async cleanupOldNotifications() {
    try {
      console.log('Cleaning up old notifications...');
      
      const deletedCount = await NotificationService.cleanupOldNotifications();
      
      console.log(`Cleaned up ${deletedCount} old notifications`);
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
    }
  }

  static async generateDailyReports() {
    try {
      console.log('Generating daily reports...');
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const startDate = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
      const endDate = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();
      
      // Get TAT report for yesterday
      const tatReport = await TATService.getTATReport({
        startDate,
        endDate
      });
      
      // Get escalation stats
      const escalationStats = await EscalationService.getEscalationStats({
        startDate,
        endDate
      });
      
      // Send daily summary to administrators
      await this.sendDailySummary(tatReport, escalationStats, yesterday);
      
      console.log('Daily reports generated and sent');
    } catch (error) {
      console.error('Error generating daily reports:', error);
    }
  }

  static async performHealthCheck() {
    try {
      // Basic health checks
      const healthMetrics = {
        timestamp: new Date().toISOString(),
        database: await this.checkDatabaseHealth(),
        email: await this.checkEmailHealth(),
        memory: process.memoryUsage(),
        uptime: process.uptime()
      };
      
      // Log health status
      if (healthMetrics.database.status !== 'healthy' || healthMetrics.email.status !== 'healthy') {
        console.warn('Health check warning:', healthMetrics);
      }
      
      // Store health metrics for monitoring
      global.lastHealthCheck = healthMetrics;
      
    } catch (error) {
      console.error('Error in health check:', error);
    }
  }

  static async checkDatabaseHealth() {
    try {
      const db = require('../config/database');
      const [result] = await db.execute('SELECT 1 as health_check');
      
      return {
        status: 'healthy',
        response_time: Date.now(),
        last_check: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        last_check: new Date().toISOString()
      };
    }
  }

  static async checkEmailHealth() {
    try {
      // Simple SMTP connection test
      await EmailService.transporter.verify();
      
      return {
        status: 'healthy',
        last_check: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        last_check: new Date().toISOString()
      };
    }
  }

  static async sendEscalationSummary(escalations) {
    try {
      const UserModel = require('../models/User');
      const admins = await UserModel.findByRole('admin');
      
      const subject = `Auto-Escalation Summary - ${escalations.length} escalations created`;
      const htmlContent = this.generateEscalationSummaryTemplate(escalations);
      
      for (const admin of admins) {
        if (admin.email) {
          await EmailService.sendEmail(admin.email, subject, htmlContent);
        }
      }
    } catch (error) {
      console.error('Error sending escalation summary:', error);
    }
  }

  static async sendDailySummary(tatReport, escalationStats, date) {
    try {
      const UserModel = require('../models/User');
      const managers = await UserModel.findByRole(['admin', 'manager']);
      
      const subject = `Daily Summary - ${date.toDateString()}`;
      const htmlContent = this.generateDailySummaryTemplate(tatReport, escalationStats, date);
      
      for (const manager of managers) {
        if (manager.email) {
          await EmailService.sendEmail(manager.email, subject, htmlContent);
        }
      }
    } catch (error) {
      console.error('Error sending daily summary:', error);
    }
  }

  static generateEscalationSummaryTemplate(escalations) {
    const escalationList = escalations.map(e => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${e.issue.id}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${e.escalation_type}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${e.reason}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${new Date(e.escalated_at).toLocaleString()}</td>
      </tr>
    `).join('');

    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #333;">Auto-Escalation Summary</h2>
        <p><strong>Total Escalations:</strong> ${escalations.length}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Issue ID</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Type</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Reason</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Escalated At</th>
            </tr>
          </thead>
          <tbody>
            ${escalationList}
          </tbody>
        </table>
      </div>
    `;
  }

  static generateDailySummaryTemplate(tatReport, escalationStats, date) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #333;">Daily Summary - ${date.toDateString()}</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h3>TAT Performance</h3>
            <p><strong>Total Issues:</strong> ${tatReport.summary.total}</p>
            <p><strong>On Time:</strong> ${tatReport.summary.normal} (${tatReport.performance_metrics.on_time_resolution.toFixed(1)}%)</p>
            <p><strong>Warning:</strong> ${tatReport.summary.warning}</p>
            <p><strong>Critical:</strong> ${tatReport.summary.critical}</p>
            <p><strong>Breach:</strong> ${tatReport.summary.breach} (${tatReport.performance_metrics.sla_breach_rate.toFixed(1)}%)</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px;">
            <h3>Escalations</h3>
            <p><strong>Total:</strong> ${escalationStats.total_escalations}</p>
            <p><strong>Pending:</strong> ${escalationStats.pending_escalations}</p>
            <p><strong>Resolved:</strong> ${escalationStats.resolved_escalations}</p>
            <p><strong>Avg Resolution:</strong> ${escalationStats.avg_resolution_hours ? escalationStats.avg_resolution_hours.toFixed(1) : 'N/A'} hours</p>
          </div>
        </div>
        
        <p style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/admin/analytics" 
             style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            View Full Analytics
          </a>
        </p>
      </div>
    `;
  }

  static stop(jobName) {
    if (this.jobs[jobName]) {
      this.jobs[jobName].stop();
      delete this.jobs[jobName];
      console.log(`Stopped job '${jobName}'`);
    }
  }

  static stopAll() {
    Object.keys(this.jobs).forEach(jobName => {
      this.stop(jobName);
    });
    console.log('All cron jobs stopped');
  }

  static getJobStatus() {
    return Object.keys(this.jobs).map(name => ({
      name,
      running: this.jobs[name].running
    }));
  }
}

module.exports = CronService;
