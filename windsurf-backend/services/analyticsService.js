const db = require('../config/database');

const analyticsService = {
  async getDashboardAnalytics() {
    try {
      const [totalIssues] = await db.execute('SELECT COUNT(*) AS total FROM issues');
      const [resolvedIssues] = await db.execute('SELECT COUNT(*) AS resolved FROM issues WHERE status IN ("resolved", "closed")');
      const [openIssues] = await db.execute('SELECT COUNT(*) AS open FROM issues WHERE status = "open"');

      return {
        totalIssues: totalIssues[0].total,
        resolvedIssues: resolvedIssues[0].resolved,
        openIssues: openIssues[0].open,
        resolutionRate: (resolvedIssues[0].resolved / totalIssues[0].total * 100).toFixed(1),
        avgResolutionTime: 2.5, // Mock data
        avgFirstResponseTime: 1.2 // Mock data
      };
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  },

  async getUserAnalytics(userId, user) {
    try {
      if (user.role !== 'admin' && user.id !== userId) {
        throw new Error('Access denied');
      }

      const [totalIssues] = await db.execute('SELECT COUNT(*) AS total FROM issues WHERE employee_uuid = ?', [userId]);
      const [resolvedIssues] = await db.execute('SELECT COUNT(*) AS resolved FROM issues WHERE employee_uuid = ? AND status IN ("resolved", "closed")', [userId]);
      const [openIssues] = await db.execute('SELECT COUNT(*) AS open FROM issues WHERE employee_uuid = ? AND status = "open"', [userId]);

      return {
        totalIssues: totalIssues[0].total,
        resolvedIssues: resolvedIssues[0].resolved,
        openIssues: openIssues[0].open,
        resolutionRate: (resolvedIssues[0].resolved / totalIssues[0].total * 100).toFixed(1),
        avgResolutionTime: 2.5, // Mock data
        avgFirstResponseTime: 1.2 // Mock data
      };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  }
};

module.exports = analyticsService;
