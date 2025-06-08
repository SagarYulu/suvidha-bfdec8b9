
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class FeedbackService {
  async submitFeedback(feedbackData) {
    try {
      const id = uuidv4();
      const {
        employeeId,
        sentiment,
        feedbackText,
        rating,
        category,
        issueId = null,
        submittedAt
      } = feedbackData;

      await pool.execute(`
        INSERT INTO feedback (
          id, employee_id, sentiment, feedback_text, rating, 
          category, issue_id, submitted_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [id, employeeId, sentiment, feedbackText, rating, category, issueId, submittedAt]);

      return id;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  async getFeedbackHistory(employeeId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      const [feedback] = await pool.execute(`
        SELECT 
          f.*,
          i.title as issue_title
        FROM feedback f
        LEFT JOIN issues i ON f.issue_id = i.id
        WHERE f.employee_id = ?
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
      `, [employeeId, parseInt(limit), offset]);

      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM feedback WHERE employee_id = ?',
        [employeeId]
      );

      return {
        feedback,
        total: countResult[0].total,
        page: parseInt(page),
        totalPages: Math.ceil(countResult[0].total / limit)
      };
    } catch (error) {
      console.error('Error fetching feedback history:', error);
      throw error;
    }
  }

  async getEmployeeFeedbackAnalytics(employeeId) {
    try {
      // Get basic stats
      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_feedback,
          AVG(rating) as average_rating,
          COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive_count,
          COUNT(CASE WHEN sentiment = 'neutral' THEN 1 END) as neutral_count,
          COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) as negative_count
        FROM feedback 
        WHERE employee_id = ?
      `, [employeeId]);

      // Get feedback by category
      const [categoryStats] = await pool.execute(`
        SELECT 
          category,
          COUNT(*) as count,
          AVG(rating) as avg_rating
        FROM feedback 
        WHERE employee_id = ?
        GROUP BY category
        ORDER BY count DESC
      `, [employeeId]);

      return {
        stats: stats[0],
        categoryBreakdown: categoryStats
      };
    } catch (error) {
      console.error('Error fetching employee feedback analytics:', error);
      throw error;
    }
  }

  async getAdminFeedbackAnalytics(filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (filters.dateRange) {
        const { start, end } = filters.dateRange;
        whereClause += ' AND f.created_at BETWEEN ? AND ?';
        params.push(start, end);
      }

      if (filters.category && filters.category !== 'all') {
        whereClause += ' AND f.category = ?';
        params.push(filters.category);
      }

      if (filters.sentiment && filters.sentiment !== 'all') {
        whereClause += ' AND f.sentiment = ?';
        params.push(filters.sentiment);
      }

      // Get overall statistics
      const [overallStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_feedback,
          AVG(rating) as average_rating,
          COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive_count,
          COUNT(CASE WHEN sentiment = 'neutral' THEN 1 END) as neutral_count,
          COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) as negative_count,
          COUNT(DISTINCT employee_id) as unique_employees
        FROM feedback f
        ${whereClause}
      `, params);

      // Get sentiment distribution
      const [sentimentDist] = await pool.execute(`
        SELECT 
          sentiment,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
        FROM feedback f
        ${whereClause}
        GROUP BY sentiment
      `, params);

      // Get category analysis
      const [categoryAnalysis] = await pool.execute(`
        SELECT 
          category,
          COUNT(*) as count,
          AVG(rating) as avg_rating,
          COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive_count,
          COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) as negative_count
        FROM feedback f
        ${whereClause}
        GROUP BY category
        ORDER BY count DESC
      `, params);

      // Get recent feedback
      const [recentFeedback] = await pool.execute(`
        SELECT 
          f.*,
          e.name as employee_name,
          i.title as issue_title
        FROM feedback f
        LEFT JOIN employees e ON f.employee_id = e.id
        LEFT JOIN issues i ON f.issue_id = i.id
        ${whereClause}
        ORDER BY f.created_at DESC
        LIMIT 10
      `, params);

      return {
        overallStats: overallStats[0],
        sentimentDistribution: sentimentDist,
        categoryAnalysis,
        recentFeedback
      };
    } catch (error) {
      console.error('Error fetching admin feedback analytics:', error);
      throw error;
    }
  }

  async getSentimentTrends(timeframe) {
    try {
      let dateCondition = '';
      
      switch (timeframe) {
        case '3months':
          dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)';
          break;
        case '6months':
          dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)';
          break;
        case '1year':
          dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
          break;
        default:
          dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)';
      }

      const [trends] = await pool.execute(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive_count,
          COUNT(CASE WHEN sentiment = 'neutral' THEN 1 END) as neutral_count,
          COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) as negative_count,
          AVG(rating) as avg_rating,
          COUNT(*) as total_feedback
        FROM feedback 
        WHERE 1=1 ${dateCondition}
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month
      `);

      return trends;
    } catch (error) {
      console.error('Error fetching sentiment trends:', error);
      throw error;
    }
  }

  async getCategoryAnalysis(dateRange) {
    try {
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (dateRange) {
        const { start, end } = dateRange;
        whereClause += ' AND created_at BETWEEN ? AND ?';
        params.push(start, end);
      }

      const [analysis] = await pool.execute(`
        SELECT 
          category,
          COUNT(*) as total_feedback,
          AVG(rating) as avg_rating,
          COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive_count,
          COUNT(CASE WHEN sentiment = 'neutral' THEN 1 END) as neutral_count,
          COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) as negative_count,
          ROUND(COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) * 100.0 / COUNT(*), 2) as positive_percentage
        FROM feedback 
        ${whereClause}
        GROUP BY category
        ORDER BY total_feedback DESC
      `, params);

      return analysis;
    } catch (error) {
      console.error('Error fetching category analysis:', error);
      throw error;
    }
  }

  async exportFeedbackData(options = {}) {
    try {
      const { format = 'csv', dateRange, category, sentiment } = options;
      
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (dateRange) {
        const { start, end } = dateRange;
        whereClause += ' AND f.created_at BETWEEN ? AND ?';
        params.push(start, end);
      }

      if (category && category !== 'all') {
        whereClause += ' AND f.category = ?';
        params.push(category);
      }

      if (sentiment && sentiment !== 'all') {
        whereClause += ' AND f.sentiment = ?';
        params.push(sentiment);
      }

      const [feedback] = await pool.execute(`
        SELECT 
          f.id,
          f.employee_id,
          e.name as employee_name,
          f.sentiment,
          f.feedback_text,
          f.rating,
          f.category,
          f.issue_id,
          i.title as issue_title,
          f.created_at
        FROM feedback f
        LEFT JOIN employees e ON f.employee_id = e.id
        LEFT JOIN issues i ON f.issue_id = i.id
        ${whereClause}
        ORDER BY f.created_at DESC
      `, params);

      if (format === 'csv') {
        const csvHeader = 'ID,Employee ID,Employee Name,Sentiment,Feedback,Rating,Category,Issue ID,Issue Title,Created At\n';
        const csvRows = feedback.map(row => 
          `${row.id},"${row.employee_id}","${row.employee_name}","${row.sentiment}","${row.feedback_text}",${row.rating},"${row.category}","${row.issue_id || ''}","${row.issue_title || ''}","${row.created_at}"`
        ).join('\n');
        
        return csvHeader + csvRows;
      }

      return feedback;
    } catch (error) {
      console.error('Error exporting feedback data:', error);
      throw error;
    }
  }
}

module.exports = new FeedbackService();
