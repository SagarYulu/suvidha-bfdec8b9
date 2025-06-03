
const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get analytics data
router.get('/', authenticateToken, requireRole(['admin', 'security-admin']), async (req, res) => {
  try {
    const { startDate, endDate, city, cluster } = req.query;
    
    let dateFilter = '';
    let params = [];
    
    if (startDate && endDate) {
      dateFilter = 'AND i.created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Issue counts by status
    const [statusCounts] = await db.execute(`
      SELECT status, COUNT(*) as count
      FROM issues i
      WHERE 1=1 ${dateFilter}
      GROUP BY status
    `, params);

    // Issue counts by priority
    const [priorityCounts] = await db.execute(`
      SELECT priority, COUNT(*) as count
      FROM issues i
      WHERE 1=1 ${dateFilter}
      GROUP BY priority
    `, params);

    // Issue counts by type
    const [typeCounts] = await db.execute(`
      SELECT type_id, COUNT(*) as count
      FROM issues i
      WHERE 1=1 ${dateFilter}
      GROUP BY type_id
    `, params);

    // Recent issues
    const [recentIssues] = await db.execute(`
      SELECT 
        i.id,
        i.description,
        i.status,
        i.priority,
        i.created_at,
        e.name as employee_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      WHERE 1=1 ${dateFilter}
      ORDER BY i.created_at DESC
      LIMIT 10
    `, params);

    // Resolution time analytics
    const [resolutionTimes] = await db.execute(`
      SELECT 
        AVG(TIMESTAMPDIFF(HOUR, created_at, closed_at)) as avg_hours,
        MIN(TIMESTAMPDIFF(HOUR, created_at, closed_at)) as min_hours,
        MAX(TIMESTAMPDIFF(HOUR, created_at, closed_at)) as max_hours
      FROM issues 
      WHERE status = 'closed' AND closed_at IS NOT NULL ${dateFilter}
    `, params);

    res.json({
      statusCounts,
      priorityCounts,
      typeCounts,
      recentIssues,
      resolutionTimes: resolutionTimes[0] || { avg_hours: 0, min_hours: 0, max_hours: 0 }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get trend data
router.get('/trends', authenticateToken, requireRole(['admin', 'security-admin']), async (req, res) => {
  try {
    const { period = 'daily', days = 30 } = req.query;
    
    let dateFormat;
    switch (period) {
      case 'hourly':
        dateFormat = '%Y-%m-%d %H:00:00';
        break;
      case 'weekly':
        dateFormat = '%Y-%u';
        break;
      case 'monthly':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    const [trendData] = await db.execute(`
      SELECT 
        DATE_FORMAT(created_at, ?) as period,
        COUNT(*) as count,
        status
      FROM issues 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY period, status
      ORDER BY period ASC
    `, [dateFormat, parseInt(days)]);

    res.json({ trendData, period, days: parseInt(days) });
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ error: 'Failed to fetch trend data' });
  }
});

module.exports = router;
