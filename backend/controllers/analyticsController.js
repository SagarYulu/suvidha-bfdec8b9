
const AnalyticsService = require('../services/analyticsService');
const { HTTP_STATUS } = require('../config/constants');

class AnalyticsController {
  async getDashboardAnalytics(req, res) {
    try {
      const filters = req.query;
      const analytics = await AnalyticsService.getAdvancedIssueAnalytics(filters);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Analytics retrieved successfully',
        data: analytics
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve analytics',
        message: error.message
      });
    }
  }

  async getSLAMetrics(req, res) {
    try {
      const filters = req.query;
      const slaMetrics = await AnalyticsService.getSLAMetrics(filters);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'SLA metrics retrieved successfully',
        data: slaMetrics
      });
    } catch (error) {
      console.error('SLA metrics error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve SLA metrics',
        message: error.message
      });
    }
  }

  async getTrendAnalysis(req, res) {
    try {
      const { period = '30d' } = req.query;
      const filters = req.query;
      const trends = await AnalyticsService.getTrendAnalysis(period, filters);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Trend analysis retrieved successfully',
        data: trends
      });
    } catch (error) {
      console.error('Trend analysis error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve trend analysis',
        message: error.message
      });
    }
  }

  async getPerformanceMetrics(req, res) {
    try {
      const filters = req.query;
      const performance = await AnalyticsService.getPerformanceMetrics(filters);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Performance metrics retrieved successfully',
        data: performance
      });
    } catch (error) {
      console.error('Performance metrics error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve performance metrics',
        message: error.message
      });
    }
  }
}

module.exports = new AnalyticsController();
