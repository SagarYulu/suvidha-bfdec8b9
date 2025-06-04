
const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');

const router = express.Router();

// Get dashboard analytics
router.get('/', 
  authenticateToken, 
  requireRole(['admin', 'manager', 'support']),
  async (req, res) => {
    try {
      const { dateRange = '30d' } = req.query;
      const analytics = await analyticsService.getDashboardAnalytics(dateRange);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch analytics',
        message: error.message 
      });
    }
  }
);

// Get issue trends
router.get('/trends', 
  authenticateToken, 
  requireRole(['admin', 'manager']),
  async (req, res) => {
    try {
      const { period = 'week' } = req.query;
      const trends = await analyticsService.getIssueTrends(period);
      
      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      console.error('Trends analytics error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch trends',
        message: error.message 
      });
    }
  }
);

module.exports = router;
