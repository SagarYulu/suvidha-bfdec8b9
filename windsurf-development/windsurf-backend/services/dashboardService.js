
const IssueModel = require('../models/Issue');
const { pool } = require('../config/database');

class DashboardService {
  async getMetrics(filters = {}) {
    const { startDate, endDate } = filters;
    
    let dateFilter = '';
    let params = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Get basic metrics
    const [metrics] = await pool.execute(`
      SELECT 
        COUNT(*) as total_issues,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_issues,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_issues,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_issues,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_issues,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_issues,
        SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical_priority_issues
      FROM issues ${dateFilter}
    `, params);

    return metrics[0];
  }

  async getChartData(type, filters = {}) {
    const { startDate, endDate } = filters;
    let dateFilter = '';
    let params = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    switch (type) {
      case 'status':
        const [statusData] = await pool.execute(`
          SELECT status, COUNT(*) as count
          FROM issues ${dateFilter}
          GROUP BY status
        `, params);
        return statusData;

      case 'priority':
        const [priorityData] = await pool.execute(`
          SELECT priority, COUNT(*) as count
          FROM issues ${dateFilter}
          GROUP BY priority
        `, params);
        return priorityData;

      case 'trend':
        const [trendData] = await pool.execute(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
          FROM issues ${dateFilter}
          GROUP BY DATE(created_at)
          ORDER BY date DESC
          LIMIT 30
        `, params);
        return trendData;

      default:
        return [];
    }
  }

  async getRecentIssues(limit = 10) {
    const [issues] = await pool.execute(`
      SELECT 
        i.*,
        e.name as employee_name,
        e.email as employee_email
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      ORDER BY i.created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

    return issues;
  }
}

module.exports = new DashboardService();
