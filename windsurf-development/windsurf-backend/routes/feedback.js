
const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Submit feedback
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      issue_id,
      rating,
      feedback_text,
      resolution_satisfaction
    } = req.body;

    if (!issue_id || !rating) {
      return res.status(400).json({ error: 'Issue ID and rating are required' });
    }

    const [result] = await db.execute(`
      INSERT INTO feedback (issue_id, employee_id, rating, feedback_text, resolution_satisfaction, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [issue_id, req.user.id, rating, feedback_text, resolution_satisfaction]);

    res.status(201).json({
      feedbackId: result.insertId,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get feedback analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [];

    if (startDate && endDate) {
      dateFilter = 'AND f.created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Get average ratings
    const [avgRatings] = await db.execute(`
      SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_feedback
      FROM feedback f
      WHERE 1=1 ${dateFilter}
    `, params);

    // Get rating distribution
    const [ratingDistribution] = await db.execute(`
      SELECT rating, COUNT(*) as count
      FROM feedback f
      WHERE 1=1 ${dateFilter}
      GROUP BY rating
      ORDER BY rating
    `, params);

    // Get satisfaction levels
    const [satisfactionLevels] = await db.execute(`
      SELECT resolution_satisfaction, COUNT(*) as count
      FROM feedback f
      WHERE resolution_satisfaction IS NOT NULL ${dateFilter}
      GROUP BY resolution_satisfaction
    `, params);

    res.json({
      avgRatings: avgRatings[0],
      ratingDistribution,
      satisfactionLevels
    });

  } catch (error) {
    console.error('Error fetching feedback analytics:', error);
    res.status(500).json({ error: 'Failed to fetch feedback analytics' });
  }
});

module.exports = router;
