
const analyticsService = require('../services/analyticsService');

class AnalyticsController {
  async getDashboardAnalytics(req, res) {
    try {
      const filters = req.query;

      const [
        overallStats,
        priorityStats,
        categoryStats,
        departmentStats,
        monthlyTrends,
        assigneeStats,
        recentActivity
      ] = await Promise.all([
        analyticsService.getOverallStats(filters),
        analyticsService.getPriorityStats(filters),
        analyticsService.getCategoryStats(filters),
        analyticsService.getDepartmentStats(filters),
        analyticsService.getMonthlyTrends(),
        analyticsService.getAssigneeStats(),
        analyticsService.getRecentActivity()
      ]);

      res.json({
        overallStats,
        priorityStats,
        categoryStats,
        departmentStats,
        monthlyTrends,
        assigneeStats,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
  }

  async getUserAnalytics(req, res) {
    try {
      const userId = req.params.userId;

      const [userStats, recentIssues] = await Promise.all([
        analyticsService.getUserStats(userId),
        analyticsService.getUserRecentIssues(userId)
      ]);

      res.json({
        userStats,
        recentIssues
      });
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      res.status(500).json({ error: 'Failed to fetch user analytics' });
    }
  }
}

module.exports = new AnalyticsController();
