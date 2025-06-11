
const { getPool } = require('../config/database');

class DashboardService {
  static async getOverviewData(filters = {}) {
    const pool = getPool();
    
    // Get basic issue counts
    const [issueCounts] = await pool.execute(`
      SELECT 
        COUNT(*) as totalIssues,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as openIssues,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgressIssues,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolvedIssues,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closedIssues
      FROM issues i
      LEFT JOIN employees e ON i.employee_id = e.id
      WHERE 1=1
      ${filters.city ? 'AND e.city = ?' : ''}
      ${filters.cluster ? 'AND e.cluster = ?' : ''}
      ${filters.dateFrom ? 'AND i.created_at >= ?' : ''}
      ${filters.dateTo ? 'AND i.created_at <= ?' : ''}
    `, this.buildFilterParams(filters));

    // Get average resolution time
    const [avgResTime] = await pool.execute(`
      SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avgResolutionTime
      FROM issues i
      LEFT JOIN employees e ON i.employee_id = e.id
      WHERE resolved_at IS NOT NULL
      ${filters.city ? 'AND e.city = ?' : ''}
      ${filters.cluster ? 'AND e.cluster = ?' : ''}
      ${filters.dateFrom ? 'AND i.created_at >= ?' : ''}
      ${filters.dateTo ? 'AND i.created_at <= ?' : ''}
    `, this.buildFilterParams(filters));

    // Get issues by type
    const [issuesByType] = await pool.execute(`
      SELECT issue_type as type, COUNT(*) as count
      FROM issues i
      LEFT JOIN employees e ON i.employee_id = e.id
      WHERE 1=1
      ${filters.city ? 'AND e.city = ?' : ''}
      ${filters.cluster ? 'AND e.cluster = ?' : ''}
      ${filters.dateFrom ? 'AND i.created_at >= ?' : ''}
      ${filters.dateTo ? 'AND i.created_at <= ?' : ''}
      GROUP BY issue_type
    `, this.buildFilterParams(filters));

    // Get issues by status
    const [issuesByStatus] = await pool.execute(`
      SELECT status, COUNT(*) as count
      FROM issues i
      LEFT JOIN employees e ON i.employee_id = e.id
      WHERE 1=1
      ${filters.city ? 'AND e.city = ?' : ''}
      ${filters.cluster ? 'AND e.cluster = ?' : ''}
      ${filters.dateFrom ? 'AND i.created_at >= ?' : ''}
      ${filters.dateTo ? 'AND i.created_at <= ?' : ''}
      GROUP BY status
    `, this.buildFilterParams(filters));

    // Get issues by priority
    const [issuesByPriority] = await pool.execute(`
      SELECT priority, COUNT(*) as count
      FROM issues i
      LEFT JOIN employees e ON i.employee_id = e.id
      WHERE 1=1
      ${filters.city ? 'AND e.city = ?' : ''}
      ${filters.cluster ? 'AND e.cluster = ?' : ''}
      ${filters.dateFrom ? 'AND i.created_at >= ?' : ''}
      ${filters.dateTo ? 'AND i.created_at <= ?' : ''}
      GROUP BY priority
    `, this.buildFilterParams(filters));

    // Get user count
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM dashboard_users WHERE is_active = true');

    // Get recent issues
    const [recentIssues] = await pool.execute(`
      SELECT i.*, e.emp_name, e.emp_email, e.emp_code, e.cluster as cluster_name, e.city as city_name,
             u1.full_name as created_by_name, u2.full_name as assigned_to_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_id = e.id
      LEFT JOIN dashboard_users u1 ON i.created_by = u1.id
      LEFT JOIN dashboard_users u2 ON i.assigned_to = u2.id
      WHERE 1=1
      ${filters.city ? 'AND e.city = ?' : ''}
      ${filters.cluster ? 'AND e.cluster = ?' : ''}
      ORDER BY i.created_at DESC
      LIMIT 10
    `, this.buildFilterParams(filters));

    return {
      ...issueCounts[0],
      avgResolutionTime: avgResTime[0]?.avgResolutionTime || 0,
      issuesByType,
      issuesByStatus,
      issuesByPriority,
      userCount: userCount[0].count,
      recentIssues
    };
  }

  static async getRecentIssues(limit = 10) {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT i.*, e.emp_name, e.emp_email, e.emp_code, e.cluster as cluster_name, e.city as city_name,
             u1.full_name as created_by_name, u2.full_name as assigned_to_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_id = e.id
      LEFT JOIN dashboard_users u1 ON i.created_by = u1.id
      LEFT JOIN dashboard_users u2 ON i.assigned_to = u2.id
      ORDER BY i.created_at DESC
      LIMIT ?
    `, [limit]);
    
    return rows;
  }

  static async getUserCount() {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM dashboard_users WHERE is_active = true');
    return rows[0].count;
  }

  static async getIssuesTrend(period = '30d') {
    const pool = getPool();
    const days = parseInt(period.replace('d', ''));
    
    const [rows] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM issues 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [days]);
    
    return rows;
  }

  static async getResolutionTimeTrend(period = '30d') {
    const pool = getPool();
    const days = parseInt(period.replace('d', ''));
    
    const [rows] = await pool.execute(`
      SELECT 
        DATE(resolved_at) as date,
        AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avgTime
      FROM issues 
      WHERE resolved_at IS NOT NULL 
      AND resolved_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(resolved_at)
      ORDER BY date ASC
    `, [days]);
    
    return rows;
  }

  static buildFilterParams(filters) {
    const params = [];
    if (filters.city) params.push(filters.city);
    if (filters.cluster) params.push(filters.cluster);
    if (filters.dateFrom) params.push(filters.dateFrom);
    if (filters.dateTo) params.push(filters.dateTo);
    return params;
  }
}

module.exports = DashboardService;
