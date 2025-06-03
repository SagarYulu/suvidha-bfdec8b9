
const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', authenticateToken, authorizeRoles('admin', 'support'), analyticsController.getDashboardAnalytics);

// Get user-specific analytics
router.get('/user/:id', authenticateToken, analyticsController.getUserAnalytics);

module.exports = router;
