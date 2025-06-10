const { getPool } = require('../config/database');
const WorkingTimeUtils = require('../utils/workingTimeUtils');

class AnalyticsService {
  static async getAdvancedIssueAnalytics(filters = {}) {
    const pool = getPool();
    const { startDate, endDate, city, cluster, status, priority } = filters;

    let query = `
      SELECT 
        DATE(created_at) as date,
        status,
        priority,
        city,
        cluster,
        COUNT(*) as count,
        AVG(TIMESTAMPDIFF(HOUR, created_at, 
          CASE WHEN status = 'closed' THEN updated_at ELSE NOW() END)) as avg_resolution_hours,
        MIN(TIMESTAMPDIFF(HOUR, created_at, 
          CASE WHEN status = 'closed' THEN updated_at ELSE NOW() END)) as min_resolution_hours,
        MAX(TIMESTAMPDIFF(HOUR, created_at, 
          CASE WHEN status = 'closed' THEN updated_at ELSE NOW() END)) as max_resolution_hours
      FROM issues 
      WHERE 1=1
    `;

    const params = [];

    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }

    if (cluster) {
      query += ' AND cluster = ?';
      params.push(cluster);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    query += ' GROUP BY DATE(created_at), status, priority, city, cluster ORDER BY date DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getSLAMetrics(filters = {}) {
    const pool = getPool();
    const { startDate, endDate, city, cluster } = filters;

    // Get all issues for SLA calculation using working hours
    let query = `
      SELECT 
        id,
        priority,
        city,
        cluster,
        status,
        created_at,
        closed_at,
        updated_at
      FROM issues 
      WHERE 1=1
    `;

    const params = [];

    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }

    if (cluster) {
      query += ' AND cluster = ?';
      params.push(cluster);
    }

    const [issues] = await pool.execute(query, params);
    
    // Process issues using working hours logic
    const results = {};
    const priorities = ['low', 'medium', 'high', 'critical'];
    
    for (const priority of priorities) {
      const priorityIssues = issues.filter(issue => issue.priority === priority);
      
      let withinSLA = 0;
      let breachedSLA = 0;
      let totalResolutionTime = 0;
      let resolvedCount = 0;
      
      priorityIssues.forEach(issue => {
        const resolvedAt = issue.closed_at || issue.updated_at;
        const isResolved = issue.status === 'closed';
        
        if (isResolved && resolvedAt) {
          resolvedCount++;
          const workingHours = WorkingTimeUtils.calculateWorkingHours(issue.created_at, resolvedAt);
          totalResolutionTime += workingHours;
          
          if (WorkingTimeUtils.isWithinSLA(issue.created_at, resolvedAt, priority)) {
            withinSLA++;
          } else {
            breachedSLA++;
          }
        }
      });
      
      results[priority] = [{
        priority,
        city: city || 'All',
        cluster: cluster || 'All',
        total_issues: priorityIssues.length,
        within_sla: withinSLA,
        breached_sla: breachedSLA,
        avg_resolution_time: resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0
      }];
    }

    return results;
  }

  static async getTrendAnalysis(period = '30d', filters = {}) {
    const pool = getPool();
    const { city, cluster, issueType } = filters;

    let dateFilter = '';
    if (period === '7d') {
      dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (period === '30d') {
      dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    } else if (period === '90d') {
      dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
    }

    let query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_issues,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as resolved_issues,
        SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical_issues,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_issues,
        AVG(CASE WHEN status = 'closed' 
            THEN TIMESTAMPDIFF(HOUR, created_at, updated_at) 
            ELSE NULL END) as avg_resolution_time
      FROM issues 
      WHERE 1=1 ${dateFilter}
    `;

    const params = [];

    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }

    if (cluster) {
      query += ' AND cluster = ?';
      params.push(cluster);
    }

    if (issueType) {
      query += ' AND issue_type = ?';
      params.push(issueType);
    }

    query += ' GROUP BY DATE(created_at) ORDER BY date DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getPerformanceMetrics(filters = {}) {
    const pool = getPool();
    const { startDate, endDate, assignedTo } = filters;

    let query = `
      SELECT 
        assigned_to,
        e.emp_name as agent_name,
        COUNT(*) as total_assigned,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as resolved_count,
        AVG(CASE WHEN status = 'closed' 
            THEN TIMESTAMPDIFF(HOUR, created_at, updated_at) 
            ELSE NULL END) as avg_resolution_time,
        (SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) / COUNT(*)) * 100 as resolution_rate
      FROM issues i
      LEFT JOIN employees e ON i.assigned_to = e.id
      WHERE assigned_to IS NOT NULL
    `;

    const params = [];

    if (startDate) {
      query += ' AND i.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND i.created_at <= ?';
      params.push(endDate);
    }

    if (assignedTo) {
      query += ' AND assigned_to = ?';
      params.push(assignedTo);
    }

    query += ' GROUP BY assigned_to, e.emp_name ORDER BY resolution_rate DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getFeedbackAnalytics(filters = {}) {
    const pool = getPool();
    const { startDate, endDate, city, cluster, sentiment } = filters;

    let query = `
      SELECT 
        sentiment,
        feedback_option,
        city,
        cluster,
        agent_name,
        COUNT(*) as count,
        DATE(created_at) as feedback_date,
        AVG(CASE 
          WHEN sentiment = 'positive' THEN 1 
          WHEN sentiment = 'neutral' THEN 0 
          ELSE -1 
        END) as sentiment_score
      FROM ticket_feedback 
      WHERE 1=1
    `;

    const params = [];

    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }

    if (cluster) {
      query += ' AND cluster = ?';
      params.push(cluster);
    }

    if (sentiment) {
      query += ' AND sentiment = ?';
      params.push(sentiment);
    }

    query += ' GROUP BY sentiment, feedback_option, city, cluster, agent_name, DATE(created_at)';
    query += ' ORDER BY feedback_date DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }
}

module.exports = AnalyticsService;
