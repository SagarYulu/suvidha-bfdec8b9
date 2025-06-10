
const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation schema
const feedbackSchema = Joi.object({
  issueId: Joi.string().required(),
  feedbackOption: Joi.string().required(),
  sentiment: Joi.string().valid('positive', 'neutral', 'negative').required()
});

// Submit feedback
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = feedbackSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { issueId, feedbackOption, sentiment } = value;

    // Check if issue exists and belongs to user (for employees)
    const [issues] = await db.execute('SELECT employee_uuid FROM issues WHERE id = ?', [issueId]);
    if (issues.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (req.user.role === 'employee' && issues[0].employee_uuid !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if feedback already exists
    const [existingFeedback] = await db.execute(
      'SELECT id FROM ticket_feedback WHERE issue_id = ? AND employee_uuid = ?',
      [issueId, req.user.id]
    );

    if (existingFeedback.length > 0) {
      // Update existing feedback
      await db.execute(`
        UPDATE ticket_feedback 
        SET feedback_option = ?, sentiment = ?, created_at = NOW()
        WHERE issue_id = ? AND employee_uuid = ?
      `, [feedbackOption, sentiment, issueId, req.user.id]);
    } else {
      // Create new feedback
      await db.execute(`
        INSERT INTO ticket_feedback (
          id, issue_id, employee_uuid, feedback_option, sentiment, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `, [uuidv4(), issueId, req.user.id, feedbackOption, sentiment]);
    }

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get feedback analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    let params = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE tf.created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Sentiment distribution
    const [sentimentData] = await db.execute(`
      SELECT sentiment, COUNT(*) as count
      FROM ticket_feedback tf
      ${dateFilter}
      GROUP BY sentiment
    `, params);

    // Feedback option distribution
    const [feedbackData] = await db.execute(`
      SELECT feedback_option, COUNT(*) as count
      FROM ticket_feedback tf
      ${dateFilter}
      GROUP BY feedback_option
    `, params);

    // Recent feedback
    const [recentFeedback] = await db.execute(`
      SELECT 
        tf.*,
        e.name as employee_name,
        i.description as issue_description
      FROM ticket_feedback tf
      LEFT JOIN employees e ON tf.employee_uuid = e.id
      LEFT JOIN issues i ON tf.issue_id = i.id
      ${dateFilter}
      ORDER BY tf.created_at DESC
      LIMIT 20
    `, params);

    res.json({
      sentimentData,
      feedbackData,
      recentFeedback
    });
  } catch (error) {
    console.error('Feedback analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback analytics' });
  }
});

module.exports = router;
