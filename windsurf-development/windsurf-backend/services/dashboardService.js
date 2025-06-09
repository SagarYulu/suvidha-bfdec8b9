
const { pool } = require('../config/database');

class DashboardService {
  static async getDashboardMetrics(filters = {}) {
    let dateFilter = '';
    const params = [];

    if (filters.dateRange) {
      dateFilter = 'AND created_at BETWEEN ? AND ?';
      params.push(filters.dateRange.start, filters.dateRange.end);
    }

    // Total issues count
    const [totalIssues] = await pool.execute(
      `SELECT COUNT(*) as count FROM issues WHERE 1=1 ${dateFilter}`,
      params
    );

    // Issues by status
    const [statusCounts] = await pool.execute(
      `SELECT status, COUNT(*) as count FROM issues WHERE 1=1 ${dateFilter} GROUP BY status`,
      params
    );

    // Issues by priority
    const [priorityCounts] = await pool.execute(
      `SELECT priority, COUNT(*) as count FROM issues WHERE 1=1 ${dateFilter} GROUP BY priority`,
      params
    );

    // Recent issues
    const [recentIssues] = await pool.execute(
      `SELECT i.*, e.name as employee_name 
       FROM issues i 
       LEFT JOIN employees e ON i.employee_uuid = e.id 
       WHERE 1=1 ${dateFilter} 
       ORDER BY i.created_at DESC LIMIT 10`,
      params
    );

    return {
      totalIssues: totalIssues[0].count,
      statusCounts,
      priorityCounts,
      recentIssues
    };
  }

  static async getIssueTypePieData(filters = {}) {
    const [typeCounts] = await pool.execute(
      'SELECT type_id, COUNT(*) as count FROM issues GROUP BY type_id'
    );
    return typeCounts;
  }

  static async getCityBarData(filters = {}) {
    const [cityCounts] = await pool.execute(`
      SELECT e.city, COUNT(i.id) as count 
      FROM issues i 
      LEFT JOIN employees e ON i.employee_uuid = e.id 
      GROUP BY e.city
    `);
    return cityCounts;
  }

  static async getTrendData(timeframe = '30d') {
    const days = parseInt(timeframe.replace('d', ''));
    const [trendData] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM issues 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [days]);
    return trendData;
  }

  static async getRecentIssues(limit = 10) {
    const [issues] = await pool.execute(`
      SELECT i.*, e.name as employee_name, e.email as employee_email
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      ORDER BY i.created_at DESC
      LIMIT ?
    `, [limit]);
    return issues;
  }
}

module.exports = DashboardService;
