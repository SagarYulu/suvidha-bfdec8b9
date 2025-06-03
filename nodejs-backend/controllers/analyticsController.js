
const { pool } = require('../config/database');
const queries = require('../queries/analyticsQueries');

const getDashboardAnalytics = async (req, res) => {
  try {
    // Get various analytics data
    const [totalIssues] = await pool.execute(queries.getTotalIssues);
    const [openIssues] = await pool.execute(queries.getOpenIssues);
    const [resolvedIssues] = await pool.execute(queries.getResolvedIssues);
    const [issuesByPriority] = await pool.execute(queries.getIssuesByPriority);
    const [issuesByStatus] = await pool.execute(queries.getIssuesByStatus);
    const [recentIssues] = await pool.execute(queries.getRecentIssues);

    res.json({
      success: true,
      analytics: {
        totalIssues: totalIssues[0].count,
        openIssues: openIssues[0].count,
        resolvedIssues: resolvedIssues[0].count,
        issuesByPriority,
        issuesByStatus,
        recentIssues
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const getIssueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let issuesTrend;
    
    if (startDate && endDate) {
      [issuesTrend] = await pool.execute(
        queries.getIssuesTrendWithDateFilter,
        [startDate, endDate]
      );
    } else {
      [issuesTrend] = await pool.execute(queries.getIssuesTrend);
    }

    res.json({
      success: true,
      analytics: {
        issuesTrend
      }
    });
  } catch (error) {
    console.error('Get issue analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const getPerformanceMetrics = async (req, res) => {
  try {
    const [avgResolutionTime] = await pool.execute(queries.getAvgResolutionTime);
    const [agentPerformance] = await pool.execute(queries.getAgentPerformance);

    res.json({
      success: true,
      metrics: {
        avgResolutionTime: avgResolutionTime[0].avg_resolution_hours,
        agentPerformance
      }
    });
  } catch (error) {
    console.error('Get performance metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  getDashboardAnalytics,
  getIssueAnalytics,
  getPerformanceMetrics
};
