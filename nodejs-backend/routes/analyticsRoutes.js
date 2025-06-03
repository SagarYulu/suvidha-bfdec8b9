
const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

// Dashboard analytics
router.get('/dashboard', 
  authenticateToken, 
  authorizeRole(['admin', 'manager']), 
  analyticsController.getDashboardAnalytics
);

// Issue analytics
router.get('/issues', 
  authenticateToken, 
  authorizeRole(['admin', 'manager']), 
  analyticsController.getIssueAnalytics
);

// Performance metrics
router.get('/performance', 
  authenticateToken, 
  authorizeRole(['admin', 'manager']), 
  analyticsController.getPerformanceMetrics
);

module.exports = router;
