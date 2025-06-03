
const analyticsService = require('../services/analyticsService');

const analyticsController = {
  async getDashboardAnalytics(req, res) {
    try {
      const analytics = await analyticsService.getDashboardAnalytics();
      res.json({
        success: true,
        analytics
      });
    } catch (error) {
      console.error('Get dashboard analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard analytics'
      });
    }
  },

  async getUserAnalytics(req, res) {
    try {
      const userId = req.params.id;
      const analytics = await analyticsService.getUserAnalytics(userId, req.user);
      
      res.json({
        success: true,
        analytics
      });
    } catch (error) {
      console.error('Get user analytics error:', error);
      res.status(error.message === 'Access denied' ? 403 : 500).json({
        success: false,
        message: error.message || 'Failed to fetch user analytics'
      });
    }
  }
};

module.exports = analyticsController;
