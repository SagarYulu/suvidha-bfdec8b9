
const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

// Get dashboard metrics
router.get('/dashboard', 
  authenticateToken, 
  requireRole(['admin', 'manager']),
  analyticsController.getDashboardMetrics
);

// Get issue analytics
router.get('/issues', 
  authenticateToken, 
  requireRole(['admin', 'manager']),
  analyticsController.getIssueAnalytics
);

module.exports = router;
