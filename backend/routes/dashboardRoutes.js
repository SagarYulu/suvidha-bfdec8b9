
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middlewares/auth');

// All dashboard routes require authentication
router.use(authenticateToken);

// Dashboard analytics
router.get('/analytics', dashboardController.getOverview);
router.get('/overview', dashboardController.getOverview);

// Recent issues
router.get('/recent-issues', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await require('../services/dashboardService').getRecentIssues(limit);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Recent issues error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent issues'
    });
  }
});

// User count
router.get('/user-count', async (req, res) => {
  try {
    const count = await require('../services/dashboardService').getUserCount();
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('User count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user count'
    });
  }
});

// Issues trend
router.get('/issues-trend', async (req, res) => {
  try {
    const period = req.query.period || '30d';
    const data = await require('../services/dashboardService').getIssuesTrend(period);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Issues trend error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch issues trend'
    });
  }
});

// Resolution time trend
router.get('/resolution-time-trend', async (req, res) => {
  try {
    const period = req.query.period || '30d';
    const data = await require('../services/dashboardService').getResolutionTimeTrend(period);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Resolution time trend error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resolution time trend'
    });
  }
});

module.exports = router;
