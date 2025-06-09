
const IssueModel = require('../models/Issue');
const { pool } = require('../config/database');

class AnalyticsService {
  async getAnalytics(filters = {}) {
    const analytics = await IssueModel.getAnalytics();
    
    // Get additional metrics
    const trendData = await this.getIssuesTrend(30);
    const typeBreakdown = await this.getIssueTypeBreakdown();
    
    return {
      ...analytics,
      trendsData: trendData,
      issuesByType: typeBreakdown
    };
  }

  async getDashboardStats() {
    const [totalIssues] = await pool.execute('SELECT COUNT(*) as count FROM issues');
    const [openIssues] = await pool.execute("SELECT COUNT(*) as count FROM issues WHERE status = 'open'");
    const [inProgressIssues] = await pool.execute("SELECT COUNT(*) as count FROM issues WHERE status = 'in_progress'");
    const [resolvedIssues] = await pool.execute("SELECT COUNT(*) as count FROM issues WHERE status = 'resolved'");
    const [criticalIssues] = await pool.execute("SELECT COUNT(*) as count FROM issues WHERE priority = 'critical'");

    return {
      totalIssues: totalIssues[0].count,
      openIssues: openIssues[0].count,
      inProgressIssues: inProgressIssues[0].count,
      resolvedIssues: resolvedIssues[0].count,
      criticalIssues: criticalIssues[0].count
    };
  }

  async getIssuesTrend(days = 30) {
    const [trendData] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as issues
      FROM issues 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [days]);

    return trendData;
  }

  async getIssueTypeBreakdown() {
    const [typeData] = await pool.execute(`
      SELECT 
        type_id as type,
        COUNT(*) as count
      FROM issues
      GROUP BY type_id
      ORDER BY count DESC
    `);

    return typeData;
  }

  async getResolutionMetrics() {
    const [avgResolution] = await pool.execute(`
      SELECT 
        AVG(TIMESTAMPDIFF(HOUR, created_at, closed_at)) as avg_hours
      FROM issues 
      WHERE closed_at IS NOT NULL
    `);

    return {
      averageResolutionTimeHours: avgResolution[0].avg_hours || 0
    };
  }
}

module.exports = new AnalyticsService();
