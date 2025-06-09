
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Validation middleware
const validateFeedback = [
  body('issue_id').isUUID().withMessage('Valid issue ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 1000 }).withMessage('Comment must not exceed 1000 characters')
];

const validateFeedbackUpdate = [
  param('id').isUUID().withMessage('Valid feedback ID is required'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 1000 }).withMessage('Comment must not exceed 1000 characters')
];

// Routes

// Create feedback (employees only)
router.post('/', 
  authenticateToken,
  validateFeedback,
  handleValidationErrors,
  feedbackController.createFeedback
);

// Get specific feedback
router.get('/:id',
  authenticateToken,
  param('id').isUUID(),
  handleValidationErrors,
  feedbackController.getFeedback
);

// Get feedback for a specific issue
router.get('/issue/:issue_id',
  authenticateToken,
  param('issue_id').isUUID(),
  handleValidationErrors,
  feedbackController.getIssueFeedback
);

// Get feedback statistics (admin/manager only)
router.get('/stats/summary',
  authenticateToken,
  requireRole(['admin', 'manager']),
  feedbackController.getFeedbackStats
);

// Get user's own feedback
router.get('/user/me',
  authenticateToken,
  feedbackController.getMyFeedback
);

// Update feedback
router.put('/:id',
  authenticateToken,
  validateFeedbackUpdate,
  handleValidationErrors,
  feedbackController.updateFeedback
);

// Delete feedback
router.delete('/:id',
  authenticateToken,
  param('id').isUUID(),
  handleValidationErrors,
  feedbackController.deleteFeedback
);

module.exports = router;
