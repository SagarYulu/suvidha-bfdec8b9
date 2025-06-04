
const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get analytics dashboard data
router.get('/', 
  authenticateToken, 
  requireRole(['admin', 'super-admin', 'manager']), 
  analyticsController.getDashboardAnalytics
);

// Get user-specific analytics
router.get('/user/:userId', 
  authenticateToken, 
  analyticsController.getUserAnalytics
);

module.exports = router;
