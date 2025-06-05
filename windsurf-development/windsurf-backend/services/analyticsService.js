
const db = require('../config/database');

class AnalyticsService {
  async getDashboardMetrics() {
    try {
      const [issueStats] = await db.execute(`
        SELECT 
          COUNT(*) as total_issues,
          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_issues,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_issues,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_issues,
          SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_issues
        FROM issues
      `);

      const [userStats] = await db.execute(`
        SELECT COUNT(*) as total_users FROM dashboard_users
      `);

      const [employeeStats] = await db.execute(`
        SELECT COUNT(*) as total_employees FROM employees
      `);

      return {
        issues: issueStats[0],
        users: userStats[0],
        employees: employeeStats[0]
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  async getIssueAnalytics(timeframe = '30days') {
    try {
      let dateFilter = '';
      switch (timeframe) {
        case '7days':
          dateFilter = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
          break;
        case '30days':
          dateFilter = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
          break;
        case '90days':
          dateFilter = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
          break;
        default:
          dateFilter = '';
      }

      const [trendData] = await db.execute(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM issues
        ${dateFilter}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `);

      const [categoryData] = await db.execute(`
        SELECT 
          category,
          COUNT(*) as count
        FROM issues
        ${dateFilter}
        GROUP BY category
        ORDER BY count DESC
      `);

      const [priorityData] = await db.execute(`
        SELECT 
          priority,
          COUNT(*) as count
        FROM issues
        ${dateFilter}
        GROUP BY priority
        ORDER BY count DESC
      `);

      return {
        trends: trendData,
        categories: categoryData,
        priorities: priorityData
      };
    } catch (error) {
      console.error('Error fetching issue analytics:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
