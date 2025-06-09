
const AnalyticsService = require('../services/analyticsService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class AnalyticsController {
  async getAnalytics(req, res) {
    try {
      const filters = req.query;
      const analytics = await AnalyticsService.getAnalytics(filters);
      
      successResponse(res, analytics, 'Analytics retrieved successfully');
    } catch (error) {
      console.error('Get analytics error:', error);
      errorResponse(res, error.message);
    }
  }

  async getDashboardStats(req, res) {
    try {
      const stats = await AnalyticsService.getDashboardStats();
      
      successResponse(res, stats, 'Dashboard stats retrieved successfully');
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      errorResponse(res, error.message);
    }
  }

  async getIssuesTrend(req, res) {
    try {
      const { days = 30 } = req.query;
      const trend = await AnalyticsService.getIssuesTrend(parseInt(days));
      
      successResponse(res, trend, 'Issues trend retrieved successfully');
    } catch (error) {
      console.error('Get issues trend error:', error);
      errorResponse(res, error.message);
    }
  }
}

module.exports = new AnalyticsController();
