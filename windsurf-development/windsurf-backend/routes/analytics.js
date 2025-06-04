
const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get analytics dashboard data
router.get('/', authenticateToken, requireRole(['admin', 'super-admin', 'manager']), async (req, res) => {
  try {
    // Get overall statistics
    const [overallStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_issues,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_issues,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_issues,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_issues,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_issues,
        AVG(CASE WHEN closed_at IS NOT NULL THEN 
          TIMESTAMPDIFF(HOUR, created_at, closed_at) END) as avg_resolution_time_hours
      FROM issues
    `);

    // Get issues by priority
    const [priorityStats] = await db.execute(`
      SELECT 
        priority,
        COUNT(*) as count
      FROM issues
      GROUP BY priority
      ORDER BY FIELD(priority, 'critical', 'high', 'medium', 'low')
    `);

    // Get issues by category
    const [categoryStats] = await db.execute(`
      SELECT 
        category,
        COUNT(*) as count
      FROM issues
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `);

    // Get issues by department
    const [departmentStats] = await db.execute(`
      SELECT 
        u.department,
        COUNT(i.id) as count
      FROM issues i
      LEFT JOIN users u ON i.employee_id = u.id
      WHERE u.department IS NOT NULL
      GROUP BY u.department
      ORDER BY count DESC
      LIMIT 10
    `);

    // Get monthly trends (last 12 months)
    const [monthlyTrends] = await db.execute(`
      SELECT 
        YEAR(created_at) as year,
        MONTH(created_at) as month,
        COUNT(*) as count,
        COUNT(CASE WHEN status IN ('resolved', 'closed') THEN 1 END) as resolved_count
      FROM issues
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY year, month
    `);

    // Get top assignees performance
    const [assigneeStats] = await db.execute(`
      SELECT 
        du.name as assignee_name,
        COUNT(i.id) as total_assigned,
        COUNT(CASE WHEN i.status IN ('resolved', 'closed') THEN 1 END) as resolved_count,
        AVG(CASE WHEN i.closed_at IS NOT NULL THEN 
          TIMESTAMPDIFF(HOUR, i.created_at, i.closed_at) END) as avg_resolution_time
      FROM issues i
      LEFT JOIN dashboard_users du ON i.assigned_to = du.id
      WHERE du.name IS NOT NULL
      GROUP BY du.id, du.name
      ORDER BY total_assigned DESC
      LIMIT 10
    `);

    // Get recent activity
    const [recentActivity] = await db.execute(`
      SELECT 
        ia.action,
        ia.created_at,
        du.name as actor_name,
        i.title as issue_title
      FROM issue_activities ia
      LEFT JOIN dashboard_users du ON ia.actor_id = du.id
      LEFT JOIN issues i ON ia.issue_id = i.id
      ORDER BY ia.created_at DESC
      LIMIT 20
    `);

    res.json({
      overallStats: overallStats[0],
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
});

// Get user-specific analytics
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get user's issue statistics
    const [userStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_issues,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_issues,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_issues,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_issues,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_issues
      FROM issues
      WHERE employee_id = ?
    `, [userId]);

    // Get user's recent issues
    const [recentIssues] = await db.execute(`
      SELECT id, title, status, priority, created_at
      FROM issues
      WHERE employee_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [userId]);

    res.json({
      userStats: userStats[0],
      recentIssues
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

module.exports = router;
