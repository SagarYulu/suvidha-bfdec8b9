
const DashboardService = require('../services/dashboardService');
const { HTTP_STATUS } = require('../config/constants');

class DashboardController {
  async getOverview(req, res) {
    try {
      const filters = req.query;
      const data = await DashboardService.getOverviewData(filters);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Dashboard data retrieved successfully',
        data
      });
    } catch (error) {
      console.error('Dashboard overview error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve dashboard data',
        message: error.message
      });
    }
  }
}

module.exports = new DashboardController();
