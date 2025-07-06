
const express = require('express');
const router = express.Router();
const DashboardService = require('../services/dashboardService');
const auth = require('../middlewares/auth');
const { HTTP_STATUS } = require('../config/constants');

// Get dashboard analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const filters = req.query;
    const analytics = await DashboardService.getOverviewData(filters);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

// Get recent issues
router.get('/recent-issues', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recentIssues = await DashboardService.getRecentIssues(limit);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: recentIssues
    });
  } catch (error) {
    console.error('Recent issues error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch recent issues',
      message: error.message
    });
  }
});

// Get user count
router.get('/user-count', auth, async (req, res) => {
  try {
    const count = await DashboardService.getUserCount();
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('User count error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch user count',
      message: error.message
    });
  }
});

// Get issues trend
router.get('/issues-trend', auth, async (req, res) => {
  try {
    const period = req.query.period || '30d';
    const trend = await DashboardService.getIssuesTrend(period);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: trend
    });
  } catch (error) {
    console.error('Issues trend error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch issues trend',
      message: error.message
    });
  }
});

// Get resolution time trend
router.get('/resolution-time-trend', auth, async (req, res) => {
  try {
    const period = req.query.period || '30d';
    const trend = await DashboardService.getResolutionTimeTrend(period);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: trend
    });
  } catch (error) {
    console.error('Resolution time trend error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch resolution time trend',
      message: error.message
    });
  }
});

module.exports = router;
