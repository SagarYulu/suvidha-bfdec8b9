
const db = require('../config/database');

class AnalyticsService {
  async getOverallStats(filters = {}) {
    const { startDate, endDate } = filters;
    let whereClause = '';
    let params = [];

    if (startDate && endDate) {
      whereClause = 'WHERE created_at BETWEEN ? AND ?';
      params.push(startDate, endDate + ' 23:59:59');
    }

    const [overallStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_issues,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_issues,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_issues,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_issues,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_issues,
        AVG(CASE WHEN closed_at IS NOT NULL THEN 
          TIMESTAMPDIFF(HOUR, created_at, closed_at) END) as avg_resolution_time_hours
      FROM issues ${whereClause}
    `, params);

    return overallStats[0];
  }

  async getPriorityStats(filters = {}) {
    const { startDate, endDate } = filters;
    let whereClause = '';
    let params = [];

    if (startDate && endDate) {
      whereClause = 'WHERE created_at BETWEEN ? AND ?';
      params.push(startDate, endDate + ' 23:59:59');
    }

    const [priorityStats] = await db.execute(`
      SELECT 
        priority,
        COUNT(*) as count
      FROM issues ${whereClause}
      GROUP BY priority
      ORDER BY FIELD(priority, 'critical', 'high', 'medium', 'low')
    `, params);

    return priorityStats;
  }

  async getCategoryStats(filters = {}) {
    const { startDate, endDate } = filters;
    let whereClause = '';
    let params = [];

    if (startDate && endDate) {
      whereClause = 'WHERE i.created_at BETWEEN ? AND ?';
      params.push(startDate, endDate + ' 23:59:59');
    }

    const [categoryStats] = await db.execute(`
      SELECT 
        type_id as category,
        COUNT(*) as count
      FROM issues i
      ${whereClause}
      GROUP BY type_id
      ORDER BY count DESC
      LIMIT 10
    `, params);

    return categoryStats;
  }

  async getDepartmentStats(filters = {}) {
    const { startDate, endDate } = filters;
    let whereClause = '';
    let params = [];

    if (startDate && endDate) {
      whereClause = 'WHERE i.created_at BETWEEN ? AND ?';
      params.push(startDate, endDate + ' 23:59:59');
    }

    const [departmentStats] = await db.execute(`
      SELECT 
        e.city as department,
        COUNT(i.id) as count
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      ${whereClause}
      GROUP BY e.city
      ORDER BY count DESC
      LIMIT 10
    `, params);

    return departmentStats;
  }

  async getMonthlyTrends() {
    const [monthlyTrends] = await db.execute(`
      SELECT 
        YEAR(created_at) as year,
        MONTH(created_at) as month,
        COUNT(*) as count,
        COUNT(CASE WHEN status IN ('resolved', 'closed') THEN 1 END) as resolved_count
      FROM issues
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY year, month
    `);

    return monthlyTrends;
  }

  async getAssigneeStats() {
    const [assigneeStats] = await db.execute(`
      SELECT 
        du.name as assignee_name,
        COUNT(i.id) as total_assigned,
        COUNT(CASE WHEN i.status IN ('resolved', 'closed') THEN 1 END) as resolved_count,
        AVG(CASE WHEN i.closed_at IS NOT NULL THEN 
          TIMESTAMPDIFF(HOUR, i.created_at, i.closed_at) END) as avg_resolution_time
      FROM issues i
      LEFT JOIN dashboard_users du ON i.assigned_to = du.id
      WHERE du.name IS NOT NULL
      GROUP BY du.id, du.name
      ORDER BY total_assigned DESC
      LIMIT 10
    `);

    return assigneeStats;
  }

  async getRecentActivity() {
    const [recentActivity] = await db.execute(`
      SELECT 
        ia.action,
        ia.created_at,
        COALESCE(e.name, du.name) as actor_name,
        i.description as issue_title
      FROM issue_audit_trail ia
      LEFT JOIN employees e ON ia.employee_uuid = e.id
      LEFT JOIN dashboard_users du ON ia.employee_uuid = du.id
      LEFT JOIN issues i ON ia.issue_id = i.id
      ORDER BY ia.created_at DESC
      LIMIT 20
    `);

    return recentActivity;
  }

  async getUserStats(userId) {
    const [userStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_issues,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_issues,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_issues,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_issues,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_issues
      FROM issues
      WHERE employee_uuid = ?
    `, [userId]);

    return userStats[0];
  }

  async getUserRecentIssues(userId) {
    const [recentIssues] = await db.execute(`
      SELECT id, description, status, priority, created_at
      FROM issues
      WHERE employee_uuid = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [userId]);

    return recentIssues;
  }
}

module.exports = new AnalyticsService();
