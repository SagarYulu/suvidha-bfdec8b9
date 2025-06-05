
const analyticsService = require('../services/analyticsService');

class AnalyticsController {
  async getDashboardMetrics(req, res) {
    try {
      const metrics = await analyticsService.getDashboardMetrics();
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Dashboard metrics error:', error);
      res.status(500).json({
        error: 'Failed to fetch dashboard metrics',
        message: error.message
      });
    }
  }

  async getIssueAnalytics(req, res) {
    try {
      const { timeframe } = req.query;
      const analytics = await analyticsService.getIssueAnalytics(timeframe);
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Issue analytics error:', error);
      res.status(500).json({
        error: 'Failed to fetch issue analytics',
        message: error.message
      });
    }
  }
}

module.exports = new AnalyticsController();
