
const { getPool } = require('../config/database');

class DashboardService {
  static async getOverviewData(filters = {}) {
    const pool = getPool();
    
    try {
      // Get issue statistics
      const [issueStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as inProgress,
          COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
          COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
          AVG(CASE 
            WHEN resolved_at IS NOT NULL 
            THEN TIMESTAMPDIFF(HOUR, created_at, resolved_at) 
            ELSE NULL 
          END) as avgResolutionTime
        FROM issues
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `);

      // Get user count
      const [userCount] = await pool.execute(`
        SELECT COUNT(*) as total FROM employees WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `);

      // Get recent issues
      const [recentIssues] = await pool.execute(`
        SELECT i.*, e.emp_name, e.emp_code, c.cluster_name, ct.city_name,
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
        SELECT issue_type, COUNT(*) as count
        FROM issues 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY issue_type
      `);

      // Get city distribution
      const [cityDistribution] = await pool.execute(`
        SELECT ct.city_name as name, COUNT(i.id) as value
        FROM issues i
        LEFT JOIN employees e ON i.employee_id = e.id
        LEFT JOIN master_clusters c ON e.cluster_id = c.id
        LEFT JOIN master_cities ct ON c.city_id = ct.id
        WHERE i.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY ct.city_name
      `);

      return {
        analytics: issueStats[0],
        userCount: userCount[0].total,
        recentIssues,
        typePieData: typeDistribution,
        cityBarData: cityDistribution
      };
    } catch (error) {
      console.error('Dashboard service error:', error);
      throw error;
    }
  }
}

module.exports = DashboardService;
