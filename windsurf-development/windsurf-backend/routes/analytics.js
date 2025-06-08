
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

// Get dashboard metrics
router.get('/dashboard', auth, analyticsController.getDashboardMetrics);

// Get issue analytics
router.get('/issues', auth, analyticsController.getIssueAnalytics);

module.exports = router;
