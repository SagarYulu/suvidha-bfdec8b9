
const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

class FeedbackController {
  async submitFeedback(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { issue_id, rating, feedback_text, agent_id } = req.body;
      const employee_uuid = req.user.id;
      const id = require('uuid').v4();

      // Validate rating is emoji-based (1=😞, 2=😐, 3=😊)
      if (![1, 2, 3].includes(rating)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid rating. Must be 1 (😞), 2 (😐), or 3 (😊)'
        });
      }

      // Check if user already gave feedback for this issue
      const [existing] = await pool.execute(
        'SELECT id FROM ticket_feedback WHERE issue_id = ? AND employee_uuid = ?',
        [issue_id, employee_uuid]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Feedback already submitted for this issue'
        });
      }

      // Get employee details for context
      const [employee] = await pool.execute(
        'SELECT city, cluster FROM employees WHERE id = ?',
        [employee_uuid]
      );

      const city = employee.length > 0 ? employee[0].city : null;
      const cluster = employee.length > 0 ? employee[0].cluster : null;

      // Get agent name if provided
      let agent_name = null;
      if (agent_id) {
        const [agent] = await pool.execute(
          'SELECT name FROM dashboard_users WHERE id = ?',
          [agent_id]
        );
        agent_name = agent.length > 0 ? agent[0].name : null;
      }

      // Map rating to sentiment
      const sentimentMap = { 1: 'negative', 2: 'neutral', 3: 'positive' };
      const sentiment = sentimentMap[rating];

      // Map rating to feedback option
      const feedbackMap = { 1: 'dissatisfied', 2: 'neutral', 3: 'satisfied' };
      const feedback_option = feedbackMap[rating];

      await pool.execute(`
        INSERT INTO ticket_feedback (
          id, issue_id, employee_uuid, feedback_option, sentiment,
          city, cluster, agent_id, agent_name, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [id, issue_id, employee_uuid, feedback_option, sentiment, city, cluster, agent_id, agent_name]);

      res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully',
        data: { id, rating, sentiment, feedback_option }
      });
    } catch (error) {
      console.error('Submit feedback error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit feedback'
      });
    }
  }

  async getFeedback(req, res) {
    try {
      const { issue_id } = req.params;
      
      const [feedback] = await pool.execute(`
        SELECT tf.*, e.name as employee_name
        FROM ticket_feedback tf
        LEFT JOIN employees e ON tf.employee_uuid = e.id
        WHERE tf.issue_id = ?
        ORDER BY tf.created_at DESC
      `, [issue_id]);

      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      console.error('Get feedback error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch feedback'
      });
    }
  }

  async getFeedbackAnalytics(req, res) {
    try {
      const { startDate, endDate, city, cluster } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (startDate) {
        whereClause += ' AND tf.created_at >= ?';
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND tf.created_at <= ?';
        params.push(endDate);
      }

      if (city) {
        whereClause += ' AND tf.city = ?';
        params.push(city);
      }

      if (cluster) {
        whereClause += ' AND tf.cluster = ?';
        params.push(cluster);
      }

      const [analytics] = await pool.execute(`
        SELECT 
          COUNT(*) as total_feedback,
          COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive_count,
          COUNT(CASE WHEN sentiment = 'neutral' THEN 1 END) as neutral_count,
          COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) as negative_count,
          AVG(CASE WHEN sentiment = 'positive' THEN 3 
                   WHEN sentiment = 'neutral' THEN 2 
                   ELSE 1 END) as avg_rating
        FROM ticket_feedback tf
        ${whereClause}
      `, params);

      res.json({
        success: true,
        data: analytics[0]
      });
    } catch (error) {
      console.error('Get feedback analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch feedback analytics'
      });
    }
  }
}

module.exports = new FeedbackController();
