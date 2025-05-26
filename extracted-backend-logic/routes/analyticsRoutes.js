
// Analytics Routes
// Express.js route definitions for analytics and export functionality

const express = require('express');
const router = express.Router();

class AnalyticsRoutes {
  constructor(analyticsService, exportService, authMiddleware) {
    this.analyticsService = analyticsService;
    this.exportService = exportService;
    this.authMiddleware = authMiddleware;
  }

  setupRoutes() {
    // Get analytics data
    router.get('/',
      this.authMiddleware.authenticateAdmin.bind(this.authMiddleware),
      this.authMiddleware.requirePermission('manage:analytics'),
      async (req, res) => {
        try {
          const filters = req.query;
          
          const analytics = await this.analyticsService.getAnalytics(filters);
          
          res.json({
            success: true,
            analytics
          });

        } catch (error) {
          console.error('Error fetching analytics:', error);
          res.status(500).json({ error: 'Failed to fetch analytics' });
        }
      }
    );

    // Export issues data
    router.post('/export/issues',
      this.authMiddleware.authenticateAdmin.bind(this.authMiddleware),
      this.authMiddleware.requirePermission('manage:analytics'),
      async (req, res) => {
        try {
          const { filters = {}, dateRange = {} } = req.body;
          
          const exportResult = await this.exportService.exportIssuesData(filters, dateRange);
          
          res.json({
            success: true,
            data: exportResult.data,
            filename: exportResult.filename,
            count: exportResult.count,
            message: `Exported ${exportResult.count} issues successfully`
          });

        } catch (error) {
          console.error('Error exporting issues:', error);
          res.status(500).json({ 
            error: error.message || 'Failed to export issues data' 
          });
        }
      }
    );

    // Export analytics summary
    router.post('/export/summary',
      this.authMiddleware.authenticateAdmin.bind(this.authMiddleware),
      this.authMiddleware.requirePermission('manage:analytics'),
      async (req, res) => {
        try {
          const { filters = {} } = req.body;
          
          const exportResult = await this.exportService.exportAnalyticsSummary(filters);
          
          res.json({
            success: true,
            data: exportResult.data,
            filename: exportResult.filename,
            count: exportResult.count,
            message: 'Analytics summary exported successfully'
          });

        } catch (error) {
          console.error('Error exporting analytics summary:', error);
          res.status(500).json({ 
            error: error.message || 'Failed to export analytics summary' 
          });
        }
      }
    );

    // Get trend data
    router.get('/trends',
      this.authMiddleware.authenticateAdmin.bind(this.authMiddleware),
      this.authMiddleware.requirePermission('manage:analytics'),
      async (req, res) => {
        try {
          const filters = req.query;
          const period = req.query.period || 'daily';
          const days = parseInt(req.query.days) || 30;
          
          const trendData = await this.analyticsService.getTrendData(filters, period, days);
          
          res.json({
            success: true,
            trendData,
            period,
            days
          });

        } catch (error) {
          console.error('Error fetching trend data:', error);
          res.status(500).json({ error: 'Failed to fetch trend data' });
        }
      }
    );

    return router;
  }
}

module.exports = { AnalyticsRoutes };
