
const express = require('express');
const router = express.Router();
const feedbackController = require('../../controllers/feedbackController');
const { authenticateToken } = require('../../middleware/auth');
const { body, param, query } = require('express-validator');

// Validation middleware
const validateFeedback = [
  body('issue_id').isUUID().withMessage('Invalid issue ID'),
  body('rating').isInt({ min: 1, max: 3 }).withMessage('Rating must be 1 (😞), 2 (😐), or 3 (😊)'),
  body('feedback_text').optional().isLength({ max: 1000 }).withMessage('Feedback text too long'),
  body('agent_id').optional().isUUID().withMessage('Invalid agent ID')
];

// Routes
router.post('/', 
  authenticateToken, 
  validateFeedback, 
  feedbackController.submitFeedback
);

router.get('/:issue_id', 
  authenticateToken, 
  param('issue_id').isUUID(), 
  feedbackController.getFeedback
);

router.get('/analytics/summary', 
  authenticateToken, 
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('city').optional().isLength({ min: 1, max: 100 }),
  query('cluster').optional().isLength({ min: 1, max: 100 }),
  feedbackController.getFeedbackAnalytics
);

module.exports = router;
