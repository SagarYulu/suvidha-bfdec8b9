
const analyticsService = require('../services/analyticsService');
const tatService = require('../services/actualTatService');
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
      
      // Get core metrics and TAT data
      const [metrics, tatMetrics, slaMetrics] = await Promise.all([
        analyticsService.getDashboardMetrics(filters),
        tatService.getTATMetrics(filters),
        tatService.getSLABreaches(filters)
      ]);
      
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

  async getSLABreaches(req, res) {
    try {
      const filters = req.query;
      const slaData = await tatService.getSLABreaches(filters);
      
      res.json({
        success: true,
        data: slaData
      });
    } catch (error) {
      console.error('SLA breaches error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch SLA breaches'
      });
    }
  }

  async getAvgResolutionTime(req, res) {
    try {
      const filters = req.query;
      const avgTime = await tatService.getAvgResolutionTime(filters);
      
      res.json({
        success: true,
        data: avgTime
      });
    } catch (error) {
      console.error('Average resolution time error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch average resolution time'
      });
    }
  }

  async getTrendData(req, res) {
    try {
      const period = req.query.period || '30d';
      const filters = req.query;
      
      const trendData = await tatService.getTrendData(period, filters);
      
      res.json({
        success: true,
        data: trendData
      });
    } catch (error) {
      console.error('Trend data error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch trend data'
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
}

module.exports = new AnalyticsController();
