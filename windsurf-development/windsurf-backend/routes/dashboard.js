
const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication middleware to all dashboard routes
router.use(authenticateToken);
router.use(requireRole(['admin', 'manager', 'agent']));

// Dashboard metrics endpoint
router.get('/metrics', dashboardController.getDashboardMetrics);

// Chart data endpoints
router.get('/charts', dashboardController.getChartData);

// Recent issues endpoint
router.get('/recent-issues', dashboardController.getRecentIssues);

module.exports = router;
