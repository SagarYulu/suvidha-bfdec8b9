
const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

// Dashboard metrics
router.get('/dashboard/metrics',
  authenticateToken,
  ValidationMiddleware.validateDashboardQuery(),
  ValidationMiddleware.handleValidationErrors,
  analyticsController.getDashboardMetrics
);

// TAT Analytics
router.get('/tat',
  authenticateToken,
  ValidationMiddleware.validateAnalyticsQuery(),
  ValidationMiddleware.handleValidationErrors,
  analyticsController.getTATAnalytics
);

// Issue Analytics
router.get('/issues',
  authenticateToken,
  ValidationMiddleware.validateAnalyticsQuery(),
  ValidationMiddleware.handleValidationErrors,
  analyticsController.getIssueAnalytics
);

// Feedback Analytics
router.get('/feedback',
  authenticateToken,
  ValidationMiddleware.validateAnalyticsQuery(),
  ValidationMiddleware.handleValidationErrors,
  analyticsController.getFeedbackAnalytics
);

// SLA Metrics
router.get('/sla',
  authenticateToken,
  ValidationMiddleware.validateAnalyticsQuery(),
  ValidationMiddleware.handleValidationErrors,
  analyticsController.getSLAMetrics
);

// Sentiment Trends
router.get('/sentiment/trends',
  authenticateToken,
  ValidationMiddleware.validateSentimentQuery(),
  ValidationMiddleware.handleValidationErrors,
  analyticsController.getSentimentTrends
);

// Performance Metrics
router.get('/performance',
  authenticateToken,
  ValidationMiddleware.validatePerformanceQuery(),
  ValidationMiddleware.handleValidationErrors,
  analyticsController.getPerformanceMetrics
);

// Real-time Metrics
router.get('/realtime',
  authenticateToken,
  analyticsController.getRealtimeMetrics
);

// Export Analytics
router.get('/export',
  authenticateToken,
  ValidationMiddleware.validateExportQuery(),
  ValidationMiddleware.handleValidationErrors,
  analyticsController.exportAnalytics
);

// SLA Breach Check (Manual trigger)
router.post('/sla/check',
  authenticateToken,
  ValidationMiddleware.requireRole(['admin', 'manager']),
  analyticsController.checkSLABreaches
);

module.exports = router;
