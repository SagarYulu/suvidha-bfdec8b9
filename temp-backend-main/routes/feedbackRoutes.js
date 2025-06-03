
const express = require('express');
const { pool } = require('../config/database');
const { authenticateEmployee } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Submit feedback
router.post('/', authenticateEmployee, async (req, res) => {
  try {
    const { sentiment, reason, issueId } = req.body;
    const employeeUuid = req.employee.employee_uuid;

    if (!sentiment || !issueId) {
      return res.status(400).json({ error: 'Sentiment and issue ID are required' });
    }

    const feedbackId = uuidv4();
    
    await pool.execute(`
      INSERT INTO ticket_feedback (id, issue_id, employee_uuid, sentiment, reason, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [feedbackId, issueId, employeeUuid, sentiment, reason || '']);

    res.status(201).json({
      success: true,
      feedbackId,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get feedback analytics
router.get('/analytics', async (req, res) => {
  try {
    const [sentimentCounts] = await pool.execute(`
      SELECT sentiment, COUNT(*) as count
      FROM ticket_feedback
      GROUP BY sentiment
    `);

    const [recentFeedback] = await pool.execute(`
      SELECT tf.*, i.description as issue_description, e.employee_name
      FROM ticket_feedback tf
      LEFT JOIN issues i ON tf.issue_id = i.id
      LEFT JOIN employees e ON tf.employee_uuid = e.employee_uuid
      ORDER BY tf.created_at DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      analytics: {
        sentimentCounts: sentimentCounts.reduce((acc, item) => {
          acc[item.sentiment] = item.count;
          return acc;
        }, {}),
        recentFeedback
      }
    });
  } catch (error) {
    console.error('Error fetching feedback analytics:', error);
    res.status(500).json({ error: 'Failed to fetch feedback analytics' });
  }
});

module.exports = router;
