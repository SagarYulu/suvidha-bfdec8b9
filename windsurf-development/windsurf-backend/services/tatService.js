
const IssueModel = require('../models/Issue');
const NotificationService = require('./notificationService');
const EscalationService = require('./escalationService');

class TATService {
  // TAT thresholds in hours
  static TAT_THRESHOLDS = {
    warning: 24 * 7,    // 7 days
    critical: 24 * 14,  // 14 days
    breach: 24 * 30     // 30 days
  };

  static async calculateTAT(issueId) {
    const issue = await IssueModel.findById(issueId);
    if (!issue) return null;

    const createdAt = new Date(issue.created_at);
    const now = new Date();
    const hoursElapsed = (now - createdAt) / (1000 * 60 * 60);

    return {
      issue_id: issueId,
      hours_elapsed: hoursElapsed,
      days_elapsed: Math.floor(hoursElapsed / 24),
      status: this.getTATStatus(hoursElapsed),
      threshold_breached: hoursElapsed > this.TAT_THRESHOLDS.breach,
      next_escalation: this.getNextEscalationTime(hoursElapsed)
    };
  }

  static getTATStatus(hoursElapsed) {
    if (hoursElapsed > this.TAT_THRESHOLDS.breach) return 'breach';
    if (hoursElapsed > this.TAT_THRESHOLDS.critical) return 'critical';
    if (hoursElapsed > this.TAT_THRESHOLDS.warning) return 'warning';
    return 'normal';
  }

  static getNextEscalationTime(hoursElapsed) {
    if (hoursElapsed < this.TAT_THRESHOLDS.warning) {
      return this.TAT_THRESHOLDS.warning - hoursElapsed;
    }
    if (hoursElapsed < this.TAT_THRESHOLDS.critical) {
      return this.TAT_THRESHOLDS.critical - hoursElapsed;
    }
    if (hoursElapsed < this.TAT_THRESHOLDS.breach) {
      return this.TAT_THRESHOLDS.breach - hoursElapsed;
    }
    return 0; // Already breached
  }

  static async getTATBuckets(filters = {}) {
    const issues = await IssueModel.getAll(filters);
    const buckets = {
      normal: [],      // ≤ 7 days
      warning: [],     // 7-14 days
      critical: [],    // 14-30 days
      breach: []       // > 30 days
    };

    for (const issue of issues) {
      const tat = await this.calculateTAT(issue.id);
      if (tat) {
        buckets[tat.status].push({
          ...issue,
          tat_info: tat
        });
      }
    }

    return {
      buckets,
      summary: {
        normal: buckets.normal.length,
        warning: buckets.warning.length,
        critical: buckets.critical.length,
        breach: buckets.breach.length,
        total: issues.length
      }
    };
  }

  static async checkForEscalations() {
    const openIssues = await IssueModel.getAll({ 
      status: ['open', 'in_progress'] 
    });

    const escalationsNeeded = [];

    for (const issue of openIssues) {
      const tat = await this.calculateTAT(issue.id);
      
      if (tat.status === 'critical' && !issue.escalated_at) {
        escalationsNeeded.push({
          issue,
          tat,
          escalation_type: 'auto_critical'
        });
      } else if (tat.status === 'breach') {
        escalationsNeeded.push({
          issue,
          tat,
          escalation_type: 'auto_breach'
        });
      }
    }

    // Process escalations
    for (const escalation of escalationsNeeded) {
      await EscalationService.autoEscalate(
        escalation.issue.id,
        escalation.escalation_type,
        `Automatic escalation due to TAT ${escalation.tat.status}`
      );
    }

    return escalationsNeeded;
  }

  static async getTATReport(filters = {}) {
    const buckets = await this.getTATBuckets(filters);
    
    const report = {
      summary: buckets.summary,
      performance_metrics: {
        on_time_resolution: (buckets.summary.normal / buckets.summary.total) * 100,
        sla_breach_rate: (buckets.summary.breach / buckets.summary.total) * 100,
        average_resolution_days: await this.getAverageResolutionTime(filters)
      },
      trending: await this.getTATTrends(filters),
      top_delayed_issues: buckets.breach.slice(0, 10)
    };

    return report;
  }

  static async getAverageResolutionTime(filters = {}) {
    const resolvedIssues = await IssueModel.getAll({ 
      ...filters, 
      status: ['resolved', 'closed'] 
    });

    if (resolvedIssues.length === 0) return 0;

    let totalHours = 0;
    for (const issue of resolvedIssues) {
      const createdAt = new Date(issue.created_at);
      const resolvedAt = new Date(issue.closed_at || issue.updated_at);
      totalHours += (resolvedAt - createdAt) / (1000 * 60 * 60);
    }

    return totalHours / (resolvedIssues.length * 24); // Return in days
  }

  static async getTATTrends(filters = {}) {
    // Implementation for trending analysis
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trends = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      
      const dayFilters = {
        ...filters,
        created_date: date.toISOString().split('T')[0]
      };
      
      const dayBuckets = await this.getTATBuckets(dayFilters);
      trends.push({
        date: date.toISOString().split('T')[0],
        ...dayBuckets.summary
      });
    }

    return trends;
  }
}

module.exports = TATService;
