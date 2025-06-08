
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class FeedbackService {
  async getFeedbackAnalytics(filters = {}) {
    try {
      const { timeframe, issueType, sentiment } = filters;
      
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (timeframe && timeframe !== 'all') {
        const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
        whereClause += ' AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
        params.push(days);
      }

      if (issueType) {
        whereClause += ' AND issue_type = ?';
        params.push(issueType);
      }

      if (sentiment) {
        whereClause += ' AND sentiment = ?';
        params.push(sentiment);
      }

      const [analytics] = await db.execute(`
        SELECT 
          COUNT(*) as totalFeedback,
          AVG(rating) as averageRating,
          SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positiveFeedback,
          SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negativeFeedback,
          SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as neutralFeedback
        FROM feedback 
        ${whereClause}
      `, params);

      return analytics[0];
    } catch (error) {
      console.error('Error fetching feedback analytics:', error);
      throw error;
    }
  }

  async submitFeedback(feedbackData) {
    try {
      const id = uuidv4();
      const {
        userId,
        issueId,
        rating,
        comment,
        sentiment = 'neutral',
        issueType,
        tags
      } = feedbackData;

      await db.execute(
        `INSERT INTO feedback (id, user_id, issue_id, rating, comment, sentiment, issue_type, tags, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [id, userId, issueId, rating, comment, sentiment, issueType, JSON.stringify(tags)]
      );

      return id;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  async getFeedbackById(id) {
    try {
      const [feedback] = await db.execute(
        `SELECT f.*, e.name as user_name 
         FROM feedback f 
         LEFT JOIN employees e ON f.user_id = e.id 
         WHERE f.id = ?`,
        [id]
      );

      return feedback[0] || null;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  }
}

module.exports = new FeedbackService();
