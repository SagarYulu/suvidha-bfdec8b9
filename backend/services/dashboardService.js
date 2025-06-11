
const { getPool } = require('../config/database');

class DashboardService {
  static async getOverviewData(filters = {}) {
    const pool = getPool();
    
    try {
      // Build date filter
      let dateFilter = '';
      const params = [];
      
      if (filters.dateFrom && filters.dateTo) {
        dateFilter = 'AND i.created_at BETWEEN ? AND ?';
        params.push(filters.dateFrom, filters.dateTo);
      } else {
        dateFilter = 'AND i.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
      }

      // Get issue statistics
      const [issueStats] = await pool.execute(`
        SELECT 
          COUNT(*) as totalIssues,
          COUNT(CASE WHEN i.status = 'open' THEN 1 END) as openIssues,
          COUNT(CASE WHEN i.status = 'in_progress' THEN 1 END) as inProgressIssues,
          COUNT(CASE WHEN i.status = 'resolved' THEN 1 END) as resolvedIssues,
          COUNT(CASE WHEN i.status = 'closed' THEN 1 END) as closedIssues,
          AVG(CASE 
            WHEN i.resolved_at IS NOT NULL 
            THEN TIMESTAMPDIFF(HOUR, i.created_at, i.resolved_at) 
            ELSE NULL 
          END) as avgResolutionTime
        FROM issues i
        WHERE 1=1 ${dateFilter}
      `, params);

      // Get user count
      const [userCount] = await pool.execute(`
        SELECT COUNT(*) as total FROM employees 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `);

      // Get recent issues
      const [recentIssues] = await pool.execute(`
        SELECT i.*, e.emp_name, e.emp_code, e.emp_email,
               c.cluster_name, ct.city_name,
               assignee.full_name as assigned_to_name
        FROM issues i
        LEFT JOIN employees e ON i.employee_id = e.id
        LEFT JOIN master_clusters c ON e.cluster_id = c.id
        LEFT JOIN master_cities ct ON c.city_id = ct.id
        LEFT JOIN dashboard_users assignee ON i.assigned_to = assignee.id
        ORDER BY i.created_at DESC
        LIMIT 10
      `);

      // Get issue type distribution
      const [typeDistribution] = await pool.execute(`
        SELECT i.issue_type as type, COUNT(*) as count
        FROM issues i 
        WHERE 1=1 ${dateFilter}
        GROUP BY i.issue_type
      `, params);

      // Get issue status distribution
      const [statusDistribution] = await pool.execute(`
        SELECT i.status, COUNT(*) as count
        FROM issues i 
        WHERE 1=1 ${dateFilter}
        GROUP BY i.status
      `, params);

      // Get issue priority distribution
      const [priorityDistribution] = await pool.execute(`
        SELECT i.priority, COUNT(*) as count
        FROM issues i 
        WHERE 1=1 ${dateFilter}
        GROUP BY i.priority
      `, params);

      return {
        ...issueStats[0],
        userCount: userCount[0].total,
        recentIssues,
        issuesByType: typeDistribution,
        issuesByStatus: statusDistribution,
        issuesByPriority: priorityDistribution
      };
    } catch (error) {
      console.error('Dashboard service error:', error);
      throw error;
    }
  }

  static async getAnalytics(filters = {}) {
    return this.getOverviewData(filters);
  }

  static async getRecentIssues(limit = 10) {
    const pool = getPool();
    
    const [recentIssues] = await pool.execute(`
      SELECT i.*, e.emp_name, e.emp_code, e.emp_email,
             c.cluster_name, ct.city_name,
             assignee.full_name as assigned_to_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_id = e.id
      LEFT JOIN master_clusters c ON e.cluster_id = c.id
      LEFT JOIN master_cities ct ON c.city_id = ct.id
      LEFT JOIN dashboard_users assignee ON i.assigned_to = assignee.id
      ORDER BY i.created_at DESC
      LIMIT ?
    `, [limit]);

    return recentIssues;
  }

  static async getUserCount() {
    const pool = getPool();
    
    const [result] = await pool.execute(`
      SELECT COUNT(*) as count FROM employees 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    return result[0].count;
  }

  static async getIssuesTrend(period = '30d') {
    const pool = getPool();
    
    let dateClause = 'DATE_SUB(NOW(), INTERVAL 30 DAY)';
    if (period === '7d') dateClause = 'DATE_SUB(NOW(), INTERVAL 7 DAY)';
    if (period === '90d') dateClause = 'DATE_SUB(NOW(), INTERVAL 90 DAY)';
    
    const [trends] = await pool.execute(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM issues 
      WHERE created_at >= ${dateClause}
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    return trends;
  }

  static async getResolutionTimeTrend(period = '30d') {
    const pool = getPool();
    
    let dateClause = 'DATE_SUB(NOW(), INTERVAL 30 DAY)';
    if (period === '7d') dateClause = 'DATE_SUB(NOW(), INTERVAL 7 DAY)';
    if (period === '90d') dateClause = 'DATE_SUB(NOW(), INTERVAL 90 DAY)';
    
    const [trends] = await pool.execute(`
      SELECT DATE(resolved_at) as date, 
             AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avgTime
      FROM issues 
      WHERE resolved_at IS NOT NULL 
        AND resolved_at >= ${dateClause}
      GROUP BY DATE(resolved_at)
      ORDER BY date
    `);

    return trends;
  }
}

module.exports = DashboardService;
