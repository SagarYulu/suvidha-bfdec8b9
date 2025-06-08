
const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbacMiddleware');
const ValidationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

// Submit feedback (employees only)
router.post('/submit',
  authenticateToken,
  ValidationMiddleware.validateFeedback(),
  ValidationMiddleware.handleValidationErrors,
  feedbackController.submitFeedback
);

// Get feedback history for employee
router.get('/history/:employeeId',
  authenticateToken,
  ValidationMiddleware.validateUUIDParam('employeeId'),
  ValidationMiddleware.handleValidationErrors,
  feedbackController.getFeedbackHistory
);

// Get employee feedback analytics (admin only)
router.get('/analytics/employee/:employeeId',
  authenticateToken,
  requireRole(['admin', 'manager']),
  ValidationMiddleware.validateUUIDParam('employeeId'),
  ValidationMiddleware.handleValidationErrors,
  feedbackController.getEmployeeFeedbackAnalytics
);

// Get admin feedback analytics (admin only)
router.get('/analytics/admin',
  authenticateToken,
  requireRole(['admin', 'manager']),
  feedbackController.getAdminFeedbackAnalytics
);

// Export feedback data (admin only)
router.get('/export',
  authenticateToken,
  requireRole(['admin']),
  feedbackController.exportFeedbackData
);

// Get sentiment trends (admin only)
router.get('/trends/sentiment',
  authenticateToken,
  requireRole(['admin', 'manager']),
  feedbackController.getSentimentTrends
);

// Get category analysis (admin only)
router.get('/analytics/categories',
  authenticateToken,
  requireRole(['admin', 'manager']),
  feedbackController.getCategoryAnalysis
);

module.exports = router;
