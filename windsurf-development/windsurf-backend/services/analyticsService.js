
const db = require('../config/database');
const tatService = require('./tatService');

class AnalyticsService {
  // Get dashboard metrics
  async getDashboardMetrics(filters = {}) {
    try {
      const [tatMetrics, issueMetrics, feedbackMetrics] = await Promise.all([
        tatService.getDashboardTATMetrics(filters),
        this.getIssueMetrics(filters),
        this.getFeedbackMetrics(filters)
      ]);
      
      return {
        ...tatMetrics,
        ...issueMetrics,
        ...feedbackMetrics
      };
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      throw error;
    }
  }
  
  // Get issue metrics
  async getIssueMetrics(filters = {}) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_issues,
          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_issues,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_issues,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_issues,
          SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_issues,
          SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical_issues,
          SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_issues,
          SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium_issues,
          SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low_issues
        FROM issues 
        WHERE 1=1
      `;
      
      const params = [];
      
      // Apply filters
      if (filters.dateFrom) {
        query += ' AND created_at >= ?';
        params.push(filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query += ' AND created_at <= ?';
        params.push(filters.dateTo);
      }
      
      if (filters.city) {
        query += ' AND city = ?';
        params.push(filters.city);
      }
      
      const [rows] = await db.execute(query, params);
      const metrics = rows[0];
      
      // Calculate resolution rate
      const resolutionRate = metrics.total_issues > 0 
        ? ((metrics.resolved_issues + metrics.closed_issues) / metrics.total_issues * 100).toFixed(1)
        : 0;
      
      return {
        metrics: {
          ...metrics,
          resolution_rate: parseFloat(resolutionRate)
        }
      };
    } catch (error) {
      console.error('Error getting issue metrics:', error);
      throw error;
    }
  }
  
  // Get issue analytics (distributions)
  async getIssueAnalytics(filters = {}) {
    try {
      const [statusDist, priorityDist, cityDist, typeDist] = await Promise.all([
        this.getStatusDistribution(filters),
        this.getPriorityDistribution(filters),
        this.getCityDistribution(filters),
        this.getTypeDistribution(filters)
      ]);
      
      return {
        statusDistribution: statusDist,
        priorityDistribution: priorityDist,
        cityDistribution: cityDist,
        typeDistribution: typeDist
      };
    } catch (error) {
      console.error('Error getting issue analytics:', error);
      throw error;
    }
  }
  
  // Get status distribution
  async getStatusDistribution(filters = {}) {
    try {
      let query = `
        SELECT status, COUNT(*) as count 
        FROM issues 
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.dateFrom) {
        query += ' AND created_at >= ?';
        params.push(filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query += ' AND created_at <= ?';
        params.push(filters.dateTo);
      }
      
      query += ' GROUP BY status ORDER BY count DESC';
      
      const [rows] = await db.execute(query, params);
      
      return rows.reduce((acc, row) => {
        acc[row.status] = row.count;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting status distribution:', error);
      throw error;
    }
  }
  
  // Get priority distribution
  async getPriorityDistribution(filters = {}) {
    try {
      let query = `
        SELECT priority, COUNT(*) as count 
        FROM issues 
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.dateFrom) {
        query += ' AND created_at >= ?';
        params.push(filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query += ' AND created_at <= ?';
        params.push(filters.dateTo);
      }
      
      query += ' GROUP BY priority ORDER BY count DESC';
      
      const [rows] = await db.execute(query, params);
      
      return rows.reduce((acc, row) => {
        acc[row.priority] = row.count;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting priority distribution:', error);
      throw error;
    }
  }
  
  // Get city distribution
  async getCityDistribution(filters = {}) {
    try {
      let query = `
        SELECT city, COUNT(*) as count 
        FROM issues 
        WHERE city IS NOT NULL
      `;
      
      const params = [];
      
      if (filters.dateFrom) {
        query += ' AND created_at >= ?';
        params.push(filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query += ' AND created_at <= ?';
        params.push(filters.dateTo);
      }
      
      query += ' GROUP BY city ORDER BY count DESC LIMIT 10';
      
      const [rows] = await db.execute(query, params);
      
      return rows.reduce((acc, row) => {
        acc[row.city] = row.count;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting city distribution:', error);
      throw error;
    }
  }
  
  // Get type distribution
  async getTypeDistribution(filters = {}) {
    try {
      let query = `
        SELECT type_id, COUNT(*) as count 
        FROM issues 
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.dateFrom) {
        query += ' AND created_at >= ?';
        params.push(filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query += ' AND created_at <= ?';
        params.push(filters.dateTo);
      }
      
      query += ' GROUP BY type_id ORDER BY count DESC';
      
      const [rows] = await db.execute(query, params);
      
      return rows.reduce((acc, row) => {
        acc[row.type_id] = row.count;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting type distribution:', error);
      throw error;
    }
  }
  
  // Get feedback metrics
  async getFeedbackMetrics(filters = {}) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_feedback,
          AVG(CASE WHEN sentiment = 'positive' THEN 5 
                   WHEN sentiment = 'neutral' THEN 3 
                   WHEN sentiment = 'negative' THEN 1 
                   ELSE 3 END) as average_sentiment_score,
          SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive_feedback,
          SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral_feedback,
          SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative_feedback
        FROM ticket_feedback 
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.dateFrom) {
        query += ' AND created_at >= ?';
        params.push(filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query += ' AND created_at <= ?';
        params.push(filters.dateTo);
      }
      
      const [rows] = await db.execute(query, params);
      const feedback = rows[0];
      
      return {
        feedback: {
          ...feedback,
          average_sentiment_score: parseFloat((feedback.average_sentiment_score || 3).toFixed(1))
        }
      };
    } catch (error) {
      console.error('Error getting feedback metrics:', error);
      throw error;
    }
  }
  
  // Export analytics data
  async exportAnalyticsData(format = 'csv', filters = {}) {
    try {
      const [metrics, analytics] = await Promise.all([
        this.getDashboardMetrics(filters),
        this.getIssueAnalytics(filters)
      ]);
      
      const data = {
        summary: metrics,
        distributions: analytics,
        exportedAt: new Date().toISOString()
      };
      
      if (format === 'csv') {
        return this.convertToCSV(data);
      }
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw error;
    }
  }
  
  // Convert data to CSV format
  convertToCSV(data) {
    let csv = 'Metric,Value\n';
    
    // Add summary metrics
    Object.entries(data.summary.metrics || {}).forEach(([key, value]) => {
      csv += `${key},${value}\n`;
    });
    
    csv += '\nDistribution Type,Category,Count\n';
    
    // Add distributions
    Object.entries(data.distributions).forEach(([distType, dist]) => {
      Object.entries(dist).forEach(([category, count]) => {
        csv += `${distType},${category},${count}\n`;
      });
    });
    
    return csv;
  }
}

module.exports = new AnalyticsService();
