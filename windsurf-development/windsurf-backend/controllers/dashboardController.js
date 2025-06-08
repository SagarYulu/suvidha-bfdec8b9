
const dashboardService = require('../services/dashboardService');

class DashboardController {
  async getDashboardMetrics(req, res) {
    try {
      const filters = {
        dateRange: req.query.dateRange ? JSON.parse(req.query.dateRange) : null,
        status: req.query.status,
        priority: req.query.priority
      };

      const metrics = await dashboardService.getDashboardMetrics(filters);
      
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Get dashboard metrics error:', error);
      res.status(500).json({
        error: 'Failed to fetch dashboard metrics',
        message: error.message
      });
    }
  }

  async getChartData(req, res) {
    try {
      const { type, filters } = req.query;
      const parsedFilters = filters ? JSON.parse(filters) : {};

      let data;
      switch (type) {
        case 'issueType':
          data = await dashboardService.getIssueTypePieData(parsedFilters);
          break;
        case 'cityBar':
          data = await dashboardService.getCityBarData(parsedFilters);
          break;
        case 'trends':
          data = await dashboardService.getTrendData(parsedFilters.timeframe);
          break;
        default:
          return res.status(400).json({ error: 'Invalid chart type' });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get chart data error:', error);
      res.status(500).json({
        error: 'Failed to fetch chart data',
        message: error.message
      });
    }
  }

  async getRecentIssues(req, res) {
    try {
      const { limit = 10 } = req.query;
      const issues = await dashboardService.getRecentIssues(parseInt(limit));
      
      res.json({
        success: true,
        data: issues
      });
    } catch (error) {
      console.error('Get recent issues error:', error);
      res.status(500).json({
        error: 'Failed to fetch recent issues',
        message: error.message
      });
    }
  }
}

module.exports = new DashboardController();
