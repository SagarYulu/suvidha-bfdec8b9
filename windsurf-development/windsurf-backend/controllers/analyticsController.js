
const analyticsService = require('../services/analyticsService');
const tatService = require('../services/tatService');
const slaService = require('../services/slaService');
const sentimentService = require('../services/sentimentService');
const { validationResult } = require('express-validator');

class AnalyticsController {
  async getDashboardMetrics(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const filters = req.query;
      
      // Get core metrics
      const metrics = await analyticsService.getDashboardMetrics(filters);
      const tatMetrics = await tatService.getTATMetrics(filters);
      const slaMetrics = await slaService.getSLAMetrics(filters);
      
      res.json({
        success: true,
        data: {
          ...metrics,
          tat: tatMetrics,
          sla: slaMetrics
        }
      });
    } catch (error) {
      console.error('Dashboard metrics error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch dashboard metrics'
      });
    }
  }

  async getTATAnalytics(req, res) {
    try {
      const filters = req.query;
      const tatData = await tatService.getTATMetrics(filters);
      
      res.json({
        success: true,
        data: tatData
      });
    } catch (error) {
      console.error('TAT analytics error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch TAT analytics'
      });
    }
  }

  async getIssueAnalytics(req, res) {
    try {
      const filters = req.query;
      const analytics = await analyticsService.getIssueAnalytics(filters);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Issue analytics error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch issue analytics'
      });
    }
  }

  async getFeedbackAnalytics(req, res) {
    try {
      const filters = req.query;
      const feedbackData = await analyticsService.getFeedbackAnalytics(filters);
      const sentimentData = await sentimentService.getSentimentDistribution(
        require('../config/database').pool, 
        filters
      );
      
      res.json({
        success: true,
        data: {
          ...feedbackData,
          sentiment: sentimentData
        }
      });
    } catch (error) {
      console.error('Feedback analytics error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch feedback analytics'
      });
    }
  }

  async getSLAMetrics(req, res) {
    try {
      const filters = req.query;
      const slaData = await slaService.getSLAMetrics(filters);
      
      res.json({
        success: true,
        data: slaData
      });
    } catch (error) {
      console.error('SLA metrics error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch SLA metrics'
      });
    }
  }

  async getSentimentTrends(req, res) {
    try {
      const { period = 'week' } = req.query;
      const filters = req.query;
      
      const trends = await sentimentService.getSentimentTrends(
        require('../config/database').pool,
        period,
        filters
      );
      
      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      console.error('Sentiment trends error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch sentiment trends'
      });
    }
  }

  async getPerformanceMetrics(req, res) {
    try {
      const filters = req.query;
      
      // Get user/agent performance metrics
      const performance = await analyticsService.getAgentPerformance(filters);
      
      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      console.error('Performance metrics error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch performance metrics'
      });
    }
  }

  async exportAnalytics(req, res) {
    try {
      const { format = 'csv', type = 'issues' } = req.query;
      const filters = req.query;
      
      const exportData = await analyticsService.exportData(type, format, filters);
      
      // Set appropriate headers for file download
      const filename = `${type}_analytics_${new Date().toISOString().split('T')[0]}.${format}`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel');
      
      res.send(exportData);
    } catch (error) {
      console.error('Export analytics error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to export analytics'
      });
    }
  }

  async getRealtimeMetrics(req, res) {
    try {
      // Get current real-time metrics for dashboard
      const realtimeData = await analyticsService.getRealtimeMetrics();
      
      res.json({
        success: true,
        data: realtimeData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Realtime metrics error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch realtime metrics'
      });
    }
  }

  async checkSLABreaches(req, res) {
    try {
      // Manual trigger for SLA breach check
      const result = await slaService.checkSLABreaches();
      
      res.json({
        success: true,
        message: 'SLA breach check completed',
        data: result
      });
    } catch (error) {
      console.error('SLA breach check error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to check SLA breaches'
      });
    }
  }
}

module.exports = new AnalyticsController();
