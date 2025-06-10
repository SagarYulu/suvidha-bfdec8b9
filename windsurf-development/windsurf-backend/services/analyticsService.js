
const { pool } = require('../config/database');
const tatService = require('./tatService');

class AnalyticsService {
  async getDashboardMetrics(filters = {}) {
    try {
      const { startDate, endDate, city, cluster } = filters;
      
      // Base query conditions
      let whereConditions = ['1=1'];
      let params = [];
      
      if (startDate) {
        whereConditions.push('i.created_at >= ?');
        params.push(startDate);
      }
      
      if (endDate) {
        whereConditions.push('i.created_at <= ?');
        params.push(endDate);
      }
      
      if (city) {
        whereConditions.push('e.city = ?');
        params.push(city);
      }
      
      if (cluster) {
        whereConditions.push('e.cluster = ?');
        params.push(cluster);
      }
      
      const whereClause = whereConditions.join(' AND ');
      
      // Get total metrics
      const totalQuery = `
        SELECT 
          COUNT(*) as total_issues,
          SUM(CASE WHEN i.status = 'open' THEN 1 ELSE 0 END) as open_issues,
          SUM(CASE WHEN i.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_issues,
          SUM(CASE WHEN i.status = 'resolved' THEN 1 ELSE 0 END) as resolved_issues,
          SUM(CASE WHEN i.status = 'closed' THEN 1 ELSE 0 END) as closed_issues,
          SUM(CASE WHEN i.priority = 'critical' THEN 1 ELSE 0 END) as critical_issues,
          SUM(CASE WHEN i.priority = 'high' THEN 1 ELSE 0 END) as high_issues,
          AVG(CASE 
            WHEN i.closed_at IS NOT NULL 
            THEN DATEDIFF(i.closed_at, i.created_at) 
            ELSE NULL 
          END) as avg_resolution_time
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE ${whereClause}
      `;
      
      const [totalResults] = await pool.execute(totalQuery, params);
      const metrics = totalResults[0];
      
      // Get daily trend data (last 30 days)
      const trendQuery = `
        SELECT 
          DATE(i.created_at) as date,
          COUNT(*) as issues_created,
          SUM(CASE WHEN i.closed_at IS NOT NULL AND DATE(i.closed_at) = DATE(i.created_at) THEN 1 ELSE 0 END) as issues_resolved
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE i.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND ${whereClause}
        GROUP BY DATE(i.created_at)
        ORDER BY date DESC
      `;
      
      const [trendResults] = await pool.execute(trendQuery, params);
      
      // Get TAT metrics
      const tatMetrics = await tatService.getTATMetrics(filters);
      
      return {
        ...metrics,
        avg_resolution_time: Math.round((metrics.avg_resolution_time || 0) * 100) / 100,
        daily_trend: trendResults,
        tat_distribution: tatMetrics
      };
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      throw error;
    }
  }

  async getIssueAnalytics(filters = {}) {
    try {
      const { startDate, endDate, city, cluster } = filters;
      
      let whereConditions = ['1=1'];
      let params = [];
      
      if (startDate) {
        whereConditions.push('i.created_at >= ?');
        params.push(startDate);
      }
      
      if (endDate) {
        whereConditions.push('i.created_at <= ?');
        params.push(endDate);
      }
      
      if (city) {
        whereConditions.push('e.city = ?');
        params.push(city);
      }
      
      if (cluster) {
        whereConditions.push('e.cluster = ?');
        params.push(cluster);
      }
      
      const whereClause = whereConditions.join(' AND ');
      
      // Issue type distribution
      const typeQuery = `
        SELECT 
          i.type_id,
          COUNT(*) as count
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE ${whereClause}
        GROUP BY i.type_id
        ORDER BY count DESC
      `;
      
      // Priority distribution
      const priorityQuery = `
        SELECT 
          i.priority,
          COUNT(*) as count
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE ${whereClause}
        GROUP BY i.priority
        ORDER BY count DESC
      `;
      
      // Status distribution
      const statusQuery = `
        SELECT 
          i.status,
          COUNT(*) as count
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE ${whereClause}
        GROUP BY i.status
        ORDER BY count DESC
      `;
      
      const [typeResults] = await pool.execute(typeQuery, params);
      const [priorityResults] = await pool.execute(priorityQuery, params);
      const [statusResults] = await pool.execute(statusQuery, params);
      
      return {
        type_distribution: typeResults,
        priority_distribution: priorityResults,
        status_distribution: statusResults
      };
    } catch (error) {
      console.error('Error getting issue analytics:', error);
      throw error;
    }
  }

  async getFeedbackAnalytics(filters = {}) {
    try {
      const { startDate, endDate, city, cluster } = filters;
      
      let whereConditions = ['1=1'];
      let params = [];
      
      if (startDate) {
        whereConditions.push('f.created_at >= ?');
        params.push(startDate);
      }
      
      if (endDate) {
        whereConditions.push('f.created_at <= ?');
        params.push(endDate);
      }
      
      if (city) {
        whereConditions.push('f.city = ?');
        params.push(city);
      }
      
      if (cluster) {
        whereConditions.push('f.cluster = ?');
        params.push(cluster);
      }
      
      const whereClause = whereConditions.join(' AND ');
      
      // Feedback sentiment distribution
      const sentimentQuery = `
        SELECT 
          f.sentiment,
          COUNT(*) as count,
          AVG(CASE 
            WHEN f.sentiment = 'positive' THEN 5
            WHEN f.sentiment = 'neutral' THEN 3
            WHEN f.sentiment = 'negative' THEN 1
            ELSE 3
          END) as avg_score
        FROM ticket_feedback f
        WHERE ${whereClause}
        GROUP BY f.sentiment
        ORDER BY count DESC
      `;
      
      // Feedback options distribution
      const optionsQuery = `
        SELECT 
          f.feedback_option,
          COUNT(*) as count
        FROM ticket_feedback f
        WHERE ${whereClause}
        GROUP BY f.feedback_option
        ORDER BY count DESC
      `;
      
      const [sentimentResults] = await pool.execute(sentimentQuery, params);
      const [optionsResults] = await pool.execute(optionsQuery, params);
      
      // Calculate overall satisfaction score
      const totalFeedback = sentimentResults.reduce((sum, item) => sum + item.count, 0);
      const weightedScore = sentimentResults.reduce((sum, item) => {
        const score = item.sentiment === 'positive' ? 5 : item.sentiment === 'neutral' ? 3 : 1;
        return sum + (score * item.count);
      }, 0);
      
      const satisfactionScore = totalFeedback > 0 ? (weightedScore / totalFeedback) : 0;
      
      return {
        sentiment_distribution: sentimentResults,
        feedback_options: optionsResults,
        satisfaction_score: Math.round(satisfactionScore * 100) / 100,
        total_feedback: totalFeedback
      };
    } catch (error) {
      console.error('Error getting feedback analytics:', error);
      throw error;
    }
  }

  async getAgentPerformance(filters = {}) {
    try {
      const { startDate, endDate } = filters;
      
      let whereConditions = ['i.assigned_to IS NOT NULL'];
      let params = [];
      
      if (startDate) {
        whereConditions.push('i.created_at >= ?');
        params.push(startDate);
      }
      
      if (endDate) {
        whereConditions.push('i.created_at <= ?');
        params.push(endDate);
      }
      
      const whereClause = whereConditions.join(' AND ');
      
      const performanceQuery = `
        SELECT 
          du.name as agent_name,
          du.role as agent_role,
          COUNT(*) as total_assigned,
          SUM(CASE WHEN i.status = 'resolved' OR i.status = 'closed' THEN 1 ELSE 0 END) as resolved_count,
          AVG(CASE 
            WHEN i.closed_at IS NOT NULL 
            THEN DATEDIFF(i.closed_at, i.created_at) 
            ELSE NULL 
          END) as avg_resolution_time,
          SUM(CASE 
            WHEN i.closed_at IS NOT NULL AND DATEDIFF(i.closed_at, i.created_at) <= 2 
            THEN 1 ELSE 0 
          END) as within_sla_count
        FROM issues i
        INNER JOIN dashboard_users du ON i.assigned_to = du.id
        WHERE ${whereClause}
        GROUP BY i.assigned_to, du.name, du.role
        ORDER BY resolved_count DESC
      `;
      
      const [results] = await pool.execute(performanceQuery, params);
      
      // Calculate performance metrics
      const performance = results.map(agent => ({
        ...agent,
        resolution_rate: agent.total_assigned > 0 ? (agent.resolved_count / agent.total_assigned) * 100 : 0,
        sla_compliance: agent.resolved_count > 0 ? (agent.within_sla_count / agent.resolved_count) * 100 : 0,
        avg_resolution_time: Math.round((agent.avg_resolution_time || 0) * 100) / 100
      }));
      
      return performance;
    } catch (error) {
      console.error('Error getting agent performance:', error);
      throw error;
    }
  }

  async getRealtimeMetrics() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_issues,
          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_issues,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_issues,
          SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical_issues,
          SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) as issues_today,
          SUM(CASE 
            WHEN closed_at IS NOT NULL AND closed_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) 
            THEN 1 ELSE 0 
          END) as resolved_today
        FROM issues
      `;
      
      const [results] = await pool.execute(query);
      return results[0];
    } catch (error) {
      console.error('Error getting realtime metrics:', error);
      throw error;
    }
  }

  async exportData(type, format, filters = {}) {
    try {
      let query;
      let params = [];
      
      switch (type) {
        case 'issues':
          query = `
            SELECT 
              i.id,
              i.employee_uuid,
              e.name as employee_name,
              e.email as employee_email,
              i.type_id,
              i.sub_type_id,
              i.description,
              i.status,
              i.priority,
              i.created_at,
              i.updated_at,
              i.closed_at,
              du.name as assigned_to_name
            FROM issues i
            LEFT JOIN employees e ON i.employee_uuid = e.id
            LEFT JOIN dashboard_users du ON i.assigned_to = du.id
            WHERE 1=1
          `;
          break;
        case 'feedback':
          query = `
            SELECT 
              f.id,
              f.employee_uuid,
              f.issue_id,
              f.sentiment,
              f.feedback_option,
              f.city,
              f.cluster,
              f.created_at
            FROM ticket_feedback f
            WHERE 1=1
          `;
          break;
        default:
          throw new Error('Invalid export type');
      }
      
      // Add filters
      if (filters.startDate) {
        query += ' AND created_at >= ?';
        params.push(filters.startDate);
      }
      
      if (filters.endDate) {
        query += ' AND created_at <= ?';
        params.push(filters.endDate);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const [results] = await pool.execute(query, params);
      
      if (format === 'csv') {
        return this.convertToCSV(results);
      }
      
      return results;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  convertToCSV(data) {
    if (!data || data.length === 0) {
      return '';
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }
}

module.exports = new AnalyticsService();
