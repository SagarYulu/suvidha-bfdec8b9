
const express = require('express');
const db = require('../config/database');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Get analytics dashboard data
router.get('/', authenticateToken, requirePermission('manage:analytics'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [];

    if (startDate && endDate) {
      dateFilter = 'AND created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Get issue counts by status
    const [statusCounts] = await db.execute(`
      SELECT status, COUNT(*) as count
      FROM issues
      WHERE 1=1 ${dateFilter}
      GROUP BY status
    `, params);

    // Get issue counts by priority
    const [priorityCounts] = await db.execute(`
      SELECT priority, COUNT(*) as count
      FROM issues
      WHERE 1=1 ${dateFilter}
      GROUP BY priority
    `, params);

    // Get issue counts by category
    const [categoryCounts] = await db.execute(`
      SELECT category, COUNT(*) as count
      FROM issues
      WHERE 1=1 ${dateFilter}
      GROUP BY category
    `, params);

    // Get recent issues
    const [recentIssues] = await db.execute(`
      SELECT i.*, u.name as employee_name
      FROM issues i
      LEFT JOIN users u ON i.employee_id = u.id
      WHERE 1=1 ${dateFilter}
      ORDER BY i.created_at DESC
      LIMIT 10
    `, params);

    // Get total counts
    const [totals] = await db.execute(`
      SELECT 
        COUNT(*) as total_issues,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_issues,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_issues,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_issues
      FROM issues
      WHERE 1=1 ${dateFilter}
    `, params);

    res.json({
      statusCounts,
      priorityCounts,
      categoryCounts,
      recentIssues,
      totals: totals[0]
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get trends data
router.get('/trends', authenticateToken, requirePermission('manage:analytics'), async (req, res) => {
  try {
    const { period = '30' } = req.query;

    const [trends] = await db.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as issues_created,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as issues_resolved
      FROM issues
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [parseInt(period)]);

    res.json({ trends });

  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

module.exports = router;
