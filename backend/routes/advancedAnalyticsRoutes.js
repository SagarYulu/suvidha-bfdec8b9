
const express = require('express');
const router = express.Router();
const advancedAnalyticsController = require('../controllers/advancedAnalyticsController');
const authMiddleware = require('../middlewares/auth');

// All routes require authentication
router.use(authMiddleware.authenticate);

// Advanced issue analytics
router.get('/issues/advanced', 
  authMiddleware.authorize(['admin', 'manager', 'analyst']),
  advancedAnalyticsController.getAdvancedIssueAnalytics
);

// SLA metrics
router.get('/sla-metrics',
  authMiddleware.authorize(['admin', 'manager', 'analyst']),
  advancedAnalyticsController.getSLAMetrics
);

// Trend analysis
router.get('/trends',
  authMiddleware.authorize(['admin', 'manager', 'analyst']),
  advancedAnalyticsController.getTrendAnalysis
);

// Performance metrics
router.get('/performance',
  authMiddleware.authorize(['admin', 'manager']),
  advancedAnalyticsController.getPerformanceMetrics
);

// Feedback analytics
router.get('/feedback',
  authMiddleware.authorize(['admin', 'manager', 'analyst']),
  advancedAnalyticsController.getFeedbackAnalytics
);

// Export functionality
router.get('/export',
  authMiddleware.authorize(['admin', 'manager']),
  advancedAnalyticsController.exportData
);

// Cache management
router.delete('/cache',
  authMiddleware.authorize(['admin']),
  advancedAnalyticsController.clearAnalyticsCache
);

module.exports = router;
