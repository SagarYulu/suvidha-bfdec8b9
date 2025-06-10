
const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get dashboard analytics
router.get('/', authenticateToken, requireRole(['admin', 'agent']), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    let params = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE created_at BETWEEN ? AND ?';
      params.push(start_date, end_date + ' 23:59:59');
    }

    // Total issues count
    const [totalIssues] = await db.execute(`
      SELECT COUNT(*) as count FROM issues ${dateFilter}
    `, params);

    // Issues by status
    const [issuesByStatus] = await db.execute(`
      SELECT status, COUNT(*) as count 
      FROM issues ${dateFilter}
      GROUP BY status
    `, params);

    // Issues by priority
    const [issuesByPriority] = await db.execute(`
      SELECT priority, COUNT(*) as count 
      FROM issues ${dateFilter}
      GROUP BY priority
    `, params);

    // Recent issues
    const [recentIssues] = await db.execute(`
      SELECT 
        i.id, i.description, i.status, i.priority, i.created_at,
        e.name as employee_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      ${dateFilter}
      ORDER BY i.created_at DESC
      LIMIT 10
    `, params);

    // Issues resolution time (average days to close)
    const [resolutionTime] = await db.execute(`
      SELECT 
        AVG(DATEDIFF(closed_at, created_at)) as avg_resolution_days
      FROM issues 
      WHERE status = 'closed' AND closed_at IS NOT NULL
      ${dateFilter ? 'AND ' + dateFilter.replace('WHERE ', '') : ''}
    `, params);

    // Monthly trend
    const [monthlyTrend] = await db.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM issues
      ${dateFilter}
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
      LIMIT 12
    `, params);

    res.json({
      totalIssues: totalIssues[0].count,
      issuesByStatus,
      issuesByPriority,
      recentIssues,
      avgResolutionDays: resolutionTime[0].avg_resolution_days || 0,
      monthlyTrend
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get trends data
router.get('/trends', authenticateToken, requireRole(['admin', 'agent']), async (req, res) => {
  try {
    const { period = '30days', metric = 'issues' } = req.query;
    
    let dateQuery = '';
    let groupBy = '';
    
    switch (period) {
      case '7days':
        dateQuery = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
        groupBy = 'DATE(created_at)';
        break;
      case '30days':
        dateQuery = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
        groupBy = 'DATE(created_at)';
        break;
      case '6months':
        dateQuery = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)';
        groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
        break;
      case '1year':
        dateQuery = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
        groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
        break;
      default:
        dateQuery = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
        groupBy = 'DATE(created_at)';
    }

    let metricQuery = '';
    switch (metric) {
      case 'issues':
        metricQuery = 'COUNT(*) as value';
        break;
      case 'resolved':
        metricQuery = 'SUM(CASE WHEN status = "resolved" OR status = "closed" THEN 1 ELSE 0 END) as value';
        break;
      case 'pending':
        metricQuery = 'SUM(CASE WHEN status = "open" OR status = "in_progress" THEN 1 ELSE 0 END) as value';
        break;
      default:
        metricQuery = 'COUNT(*) as value';
    }

    const [trends] = await db.execute(`
      SELECT 
        ${groupBy} as period,
        ${metricQuery}
      FROM issues
      ${dateQuery}
      GROUP BY ${groupBy}
      ORDER BY period ASC
    `);

    res.json({ trends });
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// Get user performance analytics
router.get('/performance', authenticateToken, requireRole(['admin', 'agent']), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    let params = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE i.created_at BETWEEN ? AND ?';
      params.push(start_date, end_date + ' 23:59:59');
    }

    // Agent performance (issues assigned and resolved)
    const [agentPerformance] = await db.execute(`
      SELECT 
        au.name as agent_name,
        au.id as agent_id,
        COUNT(i.id) as assigned_issues,
        SUM(CASE WHEN i.status = 'resolved' OR i.status = 'closed' THEN 1 ELSE 0 END) as resolved_issues,
        AVG(CASE 
          WHEN i.status = 'closed' AND i.closed_at IS NOT NULL 
          THEN DATEDIFF(i.closed_at, i.created_at) 
          ELSE NULL 
        END) as avg_resolution_time
      FROM issues i
      JOIN dashboard_users au ON i.assigned_to = au.id
      ${dateFilter}
      GROUP BY au.id, au.name
      ORDER BY resolved_issues DESC
    `, params);

    // Department/City wise distribution
    const [cityDistribution] = await db.execute(`
      SELECT 
        e.city,
        COUNT(i.id) as issue_count,
        SUM(CASE WHEN i.status = 'resolved' OR i.status = 'closed' THEN 1 ELSE 0 END) as resolved_count
      FROM issues i
      JOIN employees e ON i.employee_uuid = e.id
      ${dateFilter}
      GROUP BY e.city
      ORDER BY issue_count DESC
    `, params);

    res.json({
      agentPerformance,
      cityDistribution
    });
  } catch (error) {
    console.error('Performance analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch performance analytics' });
  }
});

module.exports = router;
