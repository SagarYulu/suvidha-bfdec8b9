
const db = require('../config/database');

class AnalyticsService {
  async getDashboardMetrics() {
    try {
      // Get total counts
      const [issueStats] = await db.execute(`
        SELECT 
          COUNT(*) as totalIssues,
          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as openIssues,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgressIssues,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolvedIssues,
          SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closedIssues,
          SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgentIssues,
          SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as highIssues,
          SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as mediumIssues,
          SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as lowIssues
        FROM issues
      `);

      const [userStats] = await db.execute(`
        SELECT COUNT(*) as totalUsers FROM dashboard_users
      `);

      return {
        totalIssues: issueStats[0].totalIssues,
        openIssues: issueStats[0].openIssues,
        inProgressIssues: issueStats[0].inProgressIssues,
        resolvedIssues: issueStats[0].resolvedIssues,
        closedIssues: issueStats[0].closedIssues,
        urgentIssues: issueStats[0].urgentIssues,
        highIssues: issueStats[0].highIssues,
        mediumIssues: issueStats[0].mediumIssues,
        lowIssues: issueStats[0].lowIssues,
        totalUsers: userStats[0].totalUsers
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  async getIssueAnalytics(timeframe = '30d') {
    try {
      let dateFilter = '';
      switch (timeframe) {
        case '7d':
          dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
          break;
        case '30d':
          dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
          break;
        case '90d':
          dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
          break;
        default:
          dateFilter = '';
      }

      const [trends] = await db.execute(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          status,
          priority
        FROM issues 
        WHERE 1=1 ${dateFilter}
        GROUP BY DATE(created_at), status, priority
        ORDER BY date DESC
      `);

      return trends;
    } catch (error) {
      console.error('Error fetching issue analytics:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
