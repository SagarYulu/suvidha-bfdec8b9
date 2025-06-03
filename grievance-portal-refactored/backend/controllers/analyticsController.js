
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
      res.status(500).json({ error: error.message });
    }
  },

  async getUserAnalytics(req, res) {
    try {
      const analytics = await analyticsService.getUserAnalytics(req.params.id, req.user);
      res.json({
        success: true,
        analytics
      });
    } catch (error) {
      if (error.message === 'Access denied') {
        return res.status(403).json({ error: error.message });
      }
      console.error('Get user analytics error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = analyticsController;
