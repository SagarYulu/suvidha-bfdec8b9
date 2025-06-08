
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class FeedbackService {
  async getFeedbackAnalytics(filters = {}) {
    try {
      const { timeframe = '30days', issueType, sentiment } = filters;
      
      let dateFilter = '';
      switch (timeframe) {
        case '7days':
          dateFilter = 'WHERE f.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
          break;
        case '30days':
          dateFilter = 'WHERE f.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
          break;
        case '90days':
          dateFilter = 'WHERE f.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
          break;
        default:
          dateFilter = 'WHERE f.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
      }

      let additionalFilters = '';
      const params = [];

      if (issueType) {
        additionalFilters += ' AND i.type_id = ?';
        params.push(issueType);
      }

      if (sentiment) {
        additionalFilters += ' AND f.sentiment = ?';
        params.push(sentiment);
      }

      // Get basic analytics
      const [analyticsData] = await db.execute(`
        SELECT 
          COUNT(*) as total_feedback,
          AVG(f.rating) as avg_rating,
          COUNT(DISTINCT f.issue_id) as issues_with_feedback,
          SUM(CASE WHEN f.sentiment = 'positive' THEN 1 ELSE 0 END) as positive_feedback,
          SUM(CASE WHEN f.sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral_feedback,
          SUM(CASE WHEN f.sentiment = 'negative' THEN 1 ELSE 0 END) as negative_feedback
        FROM feedback f
        LEFT JOIN issues i ON f.issue_id = i.id
        ${dateFilter} ${additionalFilters}
      `, params);

      // Get total issues for response rate calculation
      const [totalIssuesData] = await db.execute(`
        SELECT COUNT(*) as total_issues
        FROM issues
        ${dateFilter.replace('f.created_at', 'created_at')}
      `);

      const analytics = analyticsData[0];
      const totalIssues = totalIssuesData[0].total_issues;
      const responseRate = totalIssues > 0 ? (analytics.issues_with_feedback / totalIssues * 100) : 0;

      return {
        total: analytics.total_feedback || 0,
        avgRating: parseFloat(analytics.avg_rating) || 0,
        responseRate: parseFloat(responseRate.toFixed(2)),
        sentimentDistribution: {
          positive: analytics.positive_feedback || 0,
          neutral: analytics.neutral_feedback || 0,
          negative: analytics.negative_feedback || 0
        }
      };
    } catch (error) {
      console.error('Error fetching feedback analytics:', error);
      throw error;
    }
  }

  async submitFeedback(feedbackData) {
    try {
      const {
        issueId,
        sentiment,
        rating,
        feedbackOption,
        comments,
        tags,
        userId
      } = feedbackData;

      const feedbackId = uuidv4();

      await db.execute(`
        INSERT INTO feedback (
          id, issue_id, user_id, sentiment, rating, feedback_option, 
          comments, tags, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        feedbackId,
        issueId,
        userId,
        sentiment,
        rating,
        feedbackOption,
        comments,
        tags ? JSON.stringify(tags) : null
      ]);

      return feedbackId;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  async getFeedbackById(id) {
    try {
      const [rows] = await db.execute(`
        SELECT f.*, i.title as issue_title, u.name as user_name
        FROM feedback f
        LEFT JOIN issues i ON f.issue_id = i.id
        LEFT JOIN dashboard_users u ON f.user_id = u.id
        WHERE f.id = ?
      `, [id]);

      if (rows.length === 0) return null;

      const feedback = rows[0];
      return {
        id: feedback.id,
        issueId: feedback.issue_id,
        issueTitle: feedback.issue_title,
        userId: feedback.user_id,
        userName: feedback.user_name,
        sentiment: feedback.sentiment,
        rating: feedback.rating,
        feedbackOption: feedback.feedback_option,
        comments: feedback.comments,
        tags: feedback.tags ? JSON.parse(feedback.tags) : [],
        createdAt: feedback.created_at
      };
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  }
}

module.exports = new FeedbackService();
