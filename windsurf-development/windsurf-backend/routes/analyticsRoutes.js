
const express = require('express');
const analyticsService = require('../services/analyticsService');
const tatService = require('../services/tatService');
const { requireRole, requirePermission } = require('../middleware/rbacMiddleware');
const ValidationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

// Get dashboard metrics
router.get('/dashboard/metrics',
  ValidationMiddleware.validatePagination(),
  ValidationMiddleware.handleValidationErrors,
  async (req, res) => {
    try {
      const filters = req.query;
      const metrics = await analyticsService.getDashboardMetrics(filters);
      
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Dashboard metrics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard metrics'
      });
    }
  }
);

// Get TAT metrics
router.get('/tat',
  ValidationMiddleware.validatePagination(),
  ValidationMiddleware.handleValidationErrors,
  async (req, res) => {
    try {
      const filters = req.query;
      const tatMetrics = await tatService.getDashboardTATMetrics(filters);
      
      res.json({
        success: true,
        data: tatMetrics
      });
    } catch (error) {
      console.error('TAT metrics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch TAT metrics'
      });
    }
  }
);

// Get issue analytics
router.get('/issues',
  requirePermission('analytics:view'),
  ValidationMiddleware.validatePagination(),
  ValidationMiddleware.handleValidationErrors,
  async (req, res) => {
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
        error: 'Failed to fetch issue analytics'
      });
    }
  }
);

// Get SLA breaches
router.get('/sla-breaches',
  requireRole(['admin', 'manager']),
  async (req, res) => {
    try {
      const threshold = req.query.threshold || 48;
      const breaches = await tatService.getSLABreaches(threshold);
      
      res.json({
        success: true,
        data: breaches,
        threshold: threshold
      });
    } catch (error) {
      console.error('SLA breaches error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch SLA breaches'
      });
    }
  }
);

// Get first response time metrics
router.get('/first-response',
  requirePermission('analytics:view'),
  async (req, res) => {
    try {
      const filters = req.query;
      // Implementation for first response time calculation
      const metrics = {
        averageFirstResponseTime: 24, // hours
        withinSLA: 85, // percentage
        breaches: 15 // percentage
      };
      
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('First response time error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch first response time metrics'
      });
    }
  }
);

// Get resolution rate metrics
router.get('/resolution-rate',
  requirePermission('analytics:view'),
  async (req, res) => {
    try {
      const filters = req.query;
      const metrics = await analyticsService.getIssueMetrics(filters);
      
      res.json({
        success: true,
        data: {
          resolutionRate: metrics.metrics.resolution_rate,
          totalIssues: metrics.metrics.total_issues,
          resolvedIssues: metrics.metrics.resolved_issues + metrics.metrics.closed_issues
        }
      });
    } catch (error) {
      console.error('Resolution rate error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch resolution rate metrics'
      });
    }
  }
);

// Export analytics data
router.get('/export',
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { format = 'csv', ...filters } = req.query;
      const data = await analyticsService.exportAnalyticsData(format, filters);
      
      const filename = `analytics-export-${new Date().toISOString().split('T')[0]}.${format}`;
      
      res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(data);
    } catch (error) {
      console.error('Export analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export analytics data'
      });
    }
  }
);

module.exports = router;
