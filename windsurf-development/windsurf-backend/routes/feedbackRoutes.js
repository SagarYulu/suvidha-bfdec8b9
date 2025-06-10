
const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const { authenticateToken } = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

// Submit feedback
router.post('/',
  authenticateToken,
  ValidationMiddleware.validateFeedback(),
  ValidationMiddleware.handleValidationErrors,
  feedbackController.submitFeedback
);

// Get feedback history for user
router.get('/history/:employeeId',
  authenticateToken,
  feedbackController.getFeedbackHistory
);

// Get feedback analytics (admin only)
router.get('/analytics',
  authenticateToken,
  feedbackController.getFeedbackAnalytics
);

// Get sentiment trends
router.get('/trends',
  authenticateToken,
  feedbackController.getSentimentTrends
);

// Get feedback for specific issue
router.get('/issue/:issueId',
  authenticateToken,
  feedbackController.getFeedbackByIssue
);

// Update feedback
router.put('/:id',
  authenticateToken,
  ValidationMiddleware.validateFeedback(),
  ValidationMiddleware.handleValidationErrors,
  feedbackController.updateFeedback
);

// Delete feedback
router.delete('/:id',
  authenticateToken,
  feedbackController.deleteFeedback
);

module.exports = router;
