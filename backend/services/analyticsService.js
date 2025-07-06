
const { getPool } = require('../config/database');

class AnalyticsService {
  static async getAdvancedAnalytics(filters = {}) {
    const pool = getPool();
    
    try {
      // Get basic issue statistics
      const stats = await this.getIssueStatistics(filters);
      
      // Get sentiment analysis from feedback
      const sentimentData = await this.getSentimentAnalysis(filters);
      
      // Get resolution time analytics
      const resolutionTimes = await this.getResolutionTimeAnalytics(filters);
      
      // Get performance metrics
      const performanceMetrics = await this.getPerformanceMetrics(filters);
      
      // Get trend analysis
      const trendData = await this.getTrendAnalysis(filters);
      
      return {
        ...stats,
        sentiment: sentimentData,
        resolutionTimes,
        performance: performanceMetrics,
        trends: trendData
      };
    } catch (error) {
      console.error('Error getting advanced analytics:', error);
      throw error;
    }
  }

  static async getIssueStatistics(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as inProgress,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
        COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high,
        AVG(CASE 
          WHEN resolved_at IS NOT NULL 
          THEN TIMESTAMPDIFF(HOUR, created_at, resolved_at) 
          ELSE NULL 
        END) as avgResolutionTime
      FROM issues i
      LEFT JOIN employees e ON i.employee_id = e.id
      LEFT JOIN master_clusters c ON e.cluster_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    query = this.applyFilters(query, filters, params);
    
    const [result] = await pool.execute(query, params);
    return result[0];
  }

  static async getSentimentAnalysis(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT 
        sentiment,
        COUNT(*) as count,
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
      FROM ticket_feedback tf
      LEFT JOIN issues i ON tf.issue_id = i.id
      LEFT JOIN employees e ON i.employee_id = e.id
      LEFT JOIN master_clusters c ON e.cluster_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    query = this.applyFilters(query, filters, params);
    query += ' GROUP BY sentiment';
    
    const [results] = await pool.execute(query, params);
    return results;
  }

  static async getResolutionTimeAnalytics(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT 
        issue_type,
        AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avgResolutionTime,
        MIN(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as minResolutionTime,
        MAX(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as maxResolutionTime,
        COUNT(*) as resolvedCount
      FROM issues i
      LEFT JOIN employees e ON i.employee_id = e.id
      LEFT JOIN master_clusters c ON e.cluster_id = c.id
      WHERE resolved_at IS NOT NULL
    `;
    
    const params = [];
    query = this.applyFilters(query, filters, params);
    query += ' GROUP BY issue_type';
    
    const [results] = await pool.execute(query, params);
    return results;
  }

  static async getPerformanceMetrics(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT 
        u.full_name as agent_name,
        COUNT(i.id) as total_assigned,
        COUNT(CASE WHEN i.status = 'resolved' THEN 1 END) as resolved_count,
        COUNT(CASE WHEN i.status = 'resolved' THEN 1 END) * 100.0 / COUNT(i.id) as resolution_rate,
        AVG(CASE 
          WHEN i.resolved_at IS NOT NULL 
          THEN TIMESTAMPDIFF(HOUR, i.created_at, i.resolved_at) 
          ELSE NULL 
        END) as avg_resolution_time
      FROM dashboard_users u
      LEFT JOIN issues i ON u.id = i.assigned_to
      LEFT JOIN employees e ON i.employee_id = e.id
      LEFT JOIN master_clusters c ON e.cluster_id = c.id
      WHERE u.role IN ('agent', 'manager') AND i.id IS NOT NULL
    `;
    
    const params = [];
    query = this.applyFilters(query, filters, params);
    query += ' GROUP BY u.id, u.full_name HAVING total_assigned > 0';
    
    const [results] = await pool.execute(query, params);
    return results;
  }

  static async getTrendAnalysis(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as issues_created,
        COUNT(CASE WHEN resolved_at IS NOT NULL THEN 1 END) as issues_resolved,
        AVG(CASE 
          WHEN resolved_at IS NOT NULL 
          THEN TIMESTAMPDIFF(HOUR, created_at, resolved_at) 
          ELSE NULL 
        END) as avg_resolution_time
      FROM issues i
      LEFT JOIN employees e ON i.employee_id = e.id
      LEFT JOIN master_clusters c ON e.cluster_id = c.id
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;
    
    const params = [];
    query = this.applyFilters(query, filters, params);
    query += ' GROUP BY DATE(created_at) ORDER BY date';
    
    const [results] = await pool.execute(query, params);
    return results;
  }

  static applyFilters(query, filters, params) {
    if (filters.city) {
      query += ' AND c.city_id = ?';
      params.push(filters.city);
    }
    
    if (filters.cluster) {
      query += ' AND e.cluster_id = ?';
      params.push(filters.cluster);
    }
    
    if (filters.issue_type) {
      query += ' AND i.issue_type = ?';
      params.push(filters.issue_type);
    }
    
    if (filters.date_from) {
      query += ' AND i.created_at >= ?';
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      query += ' AND i.created_at <= ?';
      params.push(filters.date_to);
    }
    
    return query;
  }
}

module.exports = AnalyticsService;
