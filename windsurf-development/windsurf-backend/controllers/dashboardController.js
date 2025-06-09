
const DashboardService = require('../services/dashboardService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class DashboardController {
  async getDashboardMetrics(req, res) {
    try {
      const filters = req.query;
      const metrics = await DashboardService.getMetrics(filters);
      
      successResponse(res, metrics, 'Dashboard metrics retrieved successfully');
    } catch (error) {
      console.error('Get dashboard metrics error:', error);
      errorResponse(res, error.message);
    }
  }

  async getChartData(req, res) {
    try {
      const { type } = req.query;
      const filters = req.query;
      const chartData = await DashboardService.getChartData(type, filters);
      
      successResponse(res, chartData, 'Chart data retrieved successfully');
    } catch (error) {
      console.error('Get chart data error:', error);
      errorResponse(res, error.message);
    }
  }

  async getRecentIssues(req, res) {
    try {
      const { limit = 10 } = req.query;
      const recentIssues = await DashboardService.getRecentIssues(limit);
      
      successResponse(res, recentIssues, 'Recent issues retrieved successfully');
    } catch (error) {
      console.error('Get recent issues error:', error);
      errorResponse(res, error.message);
    }
  }
}

module.exports = new DashboardController();
