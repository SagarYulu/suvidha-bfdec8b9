
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All analytics routes require authentication and admin/manager role
router.use(authenticateToken);
router.use(requireRole(['admin', 'manager', 'agent']));

// Get general analytics
router.get('/', analyticsController.getAnalytics);

// Get dashboard stats
router.get('/dashboard', analyticsController.getDashboardStats);

// Get issues trend
router.get('/trends', analyticsController.getIssuesTrend);

module.exports = router;
