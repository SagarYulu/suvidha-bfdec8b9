
const db = require('../config/database');

class AnalyticsService {
  async getDashboardAnalytics(dateRange = '30d') {
    try {
      const days = parseInt(dateRange.replace('d', '')) || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get issue counts by status
      const [statusCounts] = await db.execute(`
        SELECT 
          status,
          COUNT(*) as count
        FROM issues 
        WHERE created_at >= ?
        GROUP BY status
      `, [startDate]);

      // Get priority distribution
      const [priorityCounts] = await db.execute(`
        SELECT 
          priority,
          COUNT(*) as count
        FROM issues 
        WHERE created_at >= ?
        GROUP BY priority
      `, [startDate]);

      // Get resolution time averages
      const [resolutionTimes] = await db.execute(`
        SELECT 
          AVG(TIMESTAMPDIFF(HOUR, created_at, closed_at)) as avg_resolution_hours
        FROM issues 
        WHERE status = 'closed' 
        AND created_at >= ?
        AND closed_at IS NOT NULL
      `, [startDate]);

      // Get daily issue creation trends
      const [dailyTrends] = await db.execute(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM issues 
        WHERE created_at >= ?
        GROUP BY DATE(created_at)
        ORDER BY date
      `, [startDate]);

      // Get top categories
      const [topCategories] = await db.execute(`
        SELECT 
          category,
          COUNT(*) as count
        FROM issues 
        WHERE created_at >= ?
        GROUP BY category
        ORDER BY count DESC
        LIMIT 10
      `, [startDate]);

      return {
        statusDistribution: statusCounts,
        priorityDistribution: priorityCounts,
        averageResolutionTime: resolutionTimes[0]?.avg_resolution_hours || 0,
        dailyTrends,
        topCategories,
        totalIssues: statusCounts.reduce((sum, item) => sum + item.count, 0)
      };
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  }

  async getIssueTrends(period = 'week') {
    try {
      let groupBy, dateFormat;
      let days = 7;

      switch (period) {
        case 'week':
          groupBy = 'DATE(created_at)';
          dateFormat = '%Y-%m-%d';
          days = 7;
          break;
        case 'month':
          groupBy = 'DATE(created_at)';
          dateFormat = '%Y-%m-%d';
          days = 30;
          break;
        case 'quarter':
          groupBy = 'YEARWEEK(created_at)';
          dateFormat = '%Y-%u';
          days = 90;
          break;
        default:
          groupBy = 'DATE(created_at)';
          dateFormat = '%Y-%m-%d';
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [trends] = await db.execute(`
        SELECT 
          ${groupBy} as period,
          DATE_FORMAT(created_at, '${dateFormat}') as formatted_date,
          COUNT(*) as total_issues,
          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_issues,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_issues,
          SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_issues
        FROM issues 
        WHERE created_at >= ?
        GROUP BY ${groupBy}
        ORDER BY period
      `, [startDate]);

      return trends;
    } catch (error) {
      console.error('Error fetching issue trends:', error);
      throw error;
    }
  }

  async getUserActivityAnalytics(userId) {
    try {
      const [userStats] = await db.execute(`
        SELECT 
          COUNT(*) as total_issues_created,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_issues,
          AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_response_time
        FROM issues 
        WHERE created_by = ?
      `, [userId]);

      return userStats[0] || {};
    } catch (error) {
      console.error('Error fetching user activity analytics:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
