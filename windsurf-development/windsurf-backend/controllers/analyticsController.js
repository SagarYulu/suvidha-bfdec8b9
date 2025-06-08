
const { pool } = require('../config/database');

const analyticsController = {
  // Get dashboard metrics
  async getDashboardMetrics(req, res) {
    try {
      // Get total issues count
      const [totalIssues] = await pool.execute(
        'SELECT COUNT(*) as count FROM issues'
      );

      // Get open issues count
      const [openIssues] = await pool.execute(
        'SELECT COUNT(*) as count FROM issues WHERE status = "open"'
      );

      // Get in progress issues count
      const [inProgressIssues] = await pool.execute(
        'SELECT COUNT(*) as count FROM issues WHERE status = "in_progress"'
      );

      // Get resolved issues count
      const [resolvedIssues] = await pool.execute(
        'SELECT COUNT(*) as count FROM issues WHERE status = "resolved"'
      );

      // Get closed issues count
      const [closedIssues] = await pool.execute(
        'SELECT COUNT(*) as count FROM issues WHERE status = "closed"'
      );

      // Get total users count
      const [totalUsers] = await pool.execute(
        'SELECT COUNT(*) as count FROM dashboard_users'
      );

      // Get issues by priority
      const [issuesByPriority] = await pool.execute(`
        SELECT priority, COUNT(*) as count 
        FROM issues 
        GROUP BY priority
      `);

      // Get issues by type
      const [issuesByType] = await pool.execute(`
        SELECT type_id, COUNT(*) as count 
        FROM issues 
        GROUP BY type_id 
        ORDER BY count DESC 
        LIMIT 10
      `);

      // Get recent issues
      const [recentIssues] = await pool.execute(`
        SELECT i.*, e.name as employee_name, e.email as employee_email
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        ORDER BY i.created_at DESC 
        LIMIT 10
      `);

      // Get issues trend (last 7 days)
      const [issuesTrend] = await pool.execute(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM issues 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `);

      res.json({
        data: {
          metrics: {
            total_issues: totalIssues[0].count,
            open_issues: openIssues[0].count,
            in_progress_issues: inProgressIssues[0].count,
            resolved_issues: resolvedIssues[0].count,
            closed_issues: closedIssues[0].count,
            total_users: totalUsers[0].count
          },
          charts: {
            issues_by_priority: issuesByPriority,
            issues_by_type: issuesByType,
            issues_trend: issuesTrend
          },
          recent_issues: recentIssues
        }
      });
    } catch (error) {
      console.error('Get dashboard metrics error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
    }
  },

  // Get issue analytics
  async getIssueAnalytics(req, res) {
    try {
      const { timeframe = '30' } = req.query; // days

      // Get issues created over time
      const [issuesOverTime] = await pool.execute(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM issues 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [parseInt(timeframe)]);

      // Get resolution time analytics
      const [resolutionTimes] = await pool.execute(`
        SELECT 
          AVG(TIMESTAMPDIFF(HOUR, created_at, closed_at)) as avg_resolution_hours,
          MIN(TIMESTAMPDIFF(HOUR, created_at, closed_at)) as min_resolution_hours,
          MAX(TIMESTAMPDIFF(HOUR, created_at, closed_at)) as max_resolution_hours
        FROM issues 
        WHERE status = 'closed' 
        AND closed_at IS NOT NULL
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      `, [parseInt(timeframe)]);

      // Get issues by status distribution
      const [statusDistribution] = await pool.execute(`
        SELECT 
          status,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM issues WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)), 2) as percentage
        FROM issues 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY status
      `, [parseInt(timeframe), parseInt(timeframe)]);

      // Get issues by priority distribution
      const [priorityDistribution] = await pool.execute(`
        SELECT 
          priority,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM issues WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)), 2) as percentage
        FROM issues 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY priority
      `, [parseInt(timeframe), parseInt(timeframe)]);

      // Get top issue types
      const [topIssueTypes] = await pool.execute(`
        SELECT 
          type_id,
          COUNT(*) as count
        FROM issues 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY type_id
        ORDER BY count DESC
        LIMIT 10
      `, [parseInt(timeframe)]);

      // Get agent performance (issues resolved)
      const [agentPerformance] = await pool.execute(`
        SELECT 
          du.name as agent_name,
          COUNT(*) as resolved_count
        FROM issues i
        JOIN dashboard_users du ON i.assigned_to = du.id
        WHERE i.status = 'resolved' 
        AND i.closed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY i.assigned_to, du.name
        ORDER BY resolved_count DESC
        LIMIT 10
      `, [parseInt(timeframe)]);

      res.json({
        data: {
          timeframe: `${timeframe} days`,
          issues_over_time: issuesOverTime,
          resolution_times: resolutionTimes[0] || {
            avg_resolution_hours: 0,
            min_resolution_hours: 0,
            max_resolution_hours: 0
          },
          status_distribution: statusDistribution,
          priority_distribution: priorityDistribution,
          top_issue_types: topIssueTypes,
          agent_performance: agentPerformance
        }
      });
    } catch (error) {
      console.error('Get issue analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch issue analytics' });
    }
  }
};

module.exports = analyticsController;
