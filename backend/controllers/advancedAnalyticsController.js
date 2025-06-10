
const AnalyticsService = require('../services/analyticsService');
const ExportService = require('../services/exportService');
const cacheService = require('../services/cacheService');
const { HTTP_STATUS } = require('../config/constants');

class AdvancedAnalyticsController {
  async getAdvancedIssueAnalytics(req, res) {
    try {
      const filters = req.query;
      const cacheKey = `advanced_analytics_${JSON.stringify(filters)}`;
      
      // Try to get from cache first
      let analytics = cacheService.getAnalytics(cacheKey);
      
      if (!analytics) {
        analytics = await AnalyticsService.getAdvancedIssueAnalytics(filters);
        cacheService.setAnalytics(cacheKey, analytics);
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'Advanced analytics retrieved successfully',
        data: analytics
      });
    } catch (error) {
      console.error('Advanced analytics error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve advanced analytics',
        message: error.message
      });
    }
  }

  async getSLAMetrics(req, res) {
    try {
      const filters = req.query;
      const cacheKey = `sla_metrics_${JSON.stringify(filters)}`;
      
      let metrics = cacheService.getAnalytics(cacheKey);
      
      if (!metrics) {
        metrics = await AnalyticsService.getSLAMetrics(filters);
        cacheService.setAnalytics(cacheKey, metrics);
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'SLA metrics retrieved successfully',
        data: metrics
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
      const cacheKey = `trend_analysis_${period}_${JSON.stringify(filters)}`;
      
      let trends = cacheService.getAnalytics(cacheKey);
      
      if (!trends) {
        trends = await AnalyticsService.getTrendAnalysis(period, filters);
        cacheService.setAnalytics(cacheKey, trends);
      }

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
      const cacheKey = `performance_metrics_${JSON.stringify(filters)}`;
      
      let metrics = cacheService.getAnalytics(cacheKey);
      
      if (!metrics) {
        metrics = await AnalyticsService.getPerformanceMetrics(filters);
        cacheService.setAnalytics(cacheKey, metrics);
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'Performance metrics retrieved successfully',
        data: metrics
      });
    } catch (error) {
      console.error('Performance metrics error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve performance metrics',
        message: error.message
      });
    }
  }

  async getFeedbackAnalytics(req, res) {
    try {
      const filters = req.query;
      const cacheKey = `feedback_analytics_${JSON.stringify(filters)}`;
      
      let analytics = cacheService.getAnalytics(cacheKey);
      
      if (!analytics) {
        analytics = await AnalyticsService.getFeedbackAnalytics(filters);
        cacheService.setAnalytics(cacheKey, analytics);
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'Feedback analytics retrieved successfully',
        data: analytics
      });
    } catch (error) {
      console.error('Feedback analytics error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve feedback analytics',
        message: error.message
      });
    }
  }

  async exportData(req, res) {
    try {
      const { type, format = 'csv' } = req.query;
      const filters = req.query;

      let exportData;

      switch (type) {
        case 'issues':
          exportData = await ExportService.exportIssues(filters, format);
          break;
        case 'feedback':
          exportData = await ExportService.exportFeedback(filters, format);
          break;
        case 'analytics':
          const { analyticsType } = req.query;
          exportData = await ExportService.exportAnalytics(analyticsType, filters, format);
          break;
        default:
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            error: 'Invalid export type'
          });
      }

      res.setHeader('Content-Type', exportData.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
      res.send(exportData.content);
    } catch (error) {
      console.error('Export error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to export data',
        message: error.message
      });
    }
  }

  async clearAnalyticsCache(req, res) {
    try {
      // Clear analytics cache (admin only)
      cacheService.analyticsCache.flushAll();

      res.status(HTTP_STATUS.OK).json({
        message: 'Analytics cache cleared successfully'
      });
    } catch (error) {
      console.error('Cache clear error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to clear cache',
        message: error.message
      });
    }
  }
}

module.exports = new AdvancedAnalyticsController();
