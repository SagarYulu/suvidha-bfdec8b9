
const DashboardService = require('../services/dashboardService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class DashboardController {
  async getDashboardMetrics(req, res) {
    try {
      const filters = {
        dateRange: req.query.dateRange ? JSON.parse(req.query.dateRange) : null,
        status: req.query.status,
        priority: req.query.priority
      };

      const metrics = await DashboardService.getDashboardMetrics(filters);
      successResponse(res, metrics, 'Dashboard metrics fetched successfully');
    } catch (error) {
      console.error('Get dashboard metrics error:', error);
      errorResponse(res, 'Failed to fetch dashboard metrics', 500);
    }
  }

  async getChartData(req, res) {
    try {
      const { type, filters } = req.query;
      const parsedFilters = filters ? JSON.parse(filters) : {};

      let data;
      switch (type) {
        case 'issueType':
          data = await DashboardService.getIssueTypePieData(parsedFilters);
          break;
        case 'cityBar':
          data = await DashboardService.getCityBarData(parsedFilters);
          break;
        case 'trends':
          data = await DashboardService.getTrendData(parsedFilters.timeframe);
          break;
        default:
          return errorResponse(res, 'Invalid chart type', 400);
      }

      successResponse(res, data, 'Chart data fetched successfully');
    } catch (error) {
      console.error('Get chart data error:', error);
      errorResponse(res, 'Failed to fetch chart data', 500);
    }
  }

  async getRecentIssues(req, res) {
    try {
      const { limit = 10 } = req.query;
      const issues = await DashboardService.getRecentIssues(parseInt(limit));
      successResponse(res, issues, 'Recent issues fetched successfully');
    } catch (error) {
      console.error('Get recent issues error:', error);
      errorResponse(res, 'Failed to fetch recent issues', 500);
    }
  }
}

module.exports = new DashboardController();
