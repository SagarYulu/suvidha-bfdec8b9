
const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { status, typeId, priority, city, startDate, endDate } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND i.status = ?';
      params.push(status);
    }
    if (typeId) {
      whereClause += ' AND i.typeId = ?';
      params.push(typeId);
    }
    if (priority) {
      whereClause += ' AND i.priority = ?';
      params.push(priority);
    }
    if (city) {
      whereClause += ' AND e.city = ?';
      params.push(city);
    }
    if (startDate) {
      whereClause += ' AND DATE(i.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND DATE(i.created_at) <= ?';
      params.push(endDate);
    }

    // Total issues
    const [totalResult] = await pool.execute(`
      SELECT COUNT(*) as total FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.employee_uuid
      ${whereClause}
    `, params);

    // Resolved issues
    const [resolvedResult] = await pool.execute(`
      SELECT COUNT(*) as resolved FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.employee_uuid
      ${whereClause} AND i.status IN ('resolved', 'closed')
    `, params);

    // Open issues
    const [openResult] = await pool.execute(`
      SELECT COUNT(*) as open FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.employee_uuid
      ${whereClause} AND i.status = 'open'
    `, params);

    // Issues by type
    const [typeResult] = await pool.execute(`
      SELECT i.typeId, COUNT(*) as count FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.employee_uuid
      ${whereClause}
      GROUP BY i.typeId
    `, params);

    // Issues by city
    const [cityResult] = await pool.execute(`
      SELECT e.city, COUNT(*) as count FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.employee_uuid
      ${whereClause}
      GROUP BY e.city
    `, params);

    // Issues by cluster
    const [clusterResult] = await pool.execute(`
      SELECT e.cluster, COUNT(*) as count FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.employee_uuid
      ${whereClause}
      GROUP BY e.cluster
    `, params);

    // Issues by manager
    const [managerResult] = await pool.execute(`
      SELECT e.manager_name, COUNT(*) as count FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.employee_uuid
      ${whereClause}
      GROUP BY e.manager_name
    `, params);

    const totalIssues = totalResult[0].total;
    const resolvedIssues = resolvedResult[0].resolved;
    const openIssues = openResult[0].open;
    const resolutionRate = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0;

    // Calculate average resolution time (simplified)
    const [avgTimeResult] = await pool.execute(`
      SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, closed_at)) as avg_hours
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.employee_uuid
      ${whereClause} AND i.closed_at IS NOT NULL
    `, params);

    const avgResolutionTime = Math.round(avgTimeResult[0].avg_hours || 0);

    res.json({
      success: true,
      analytics: {
        totalIssues,
        resolvedIssues,
        openIssues,
        resolutionRate,
        avgResolutionTime,
        avgFirstResponseTime: 2, // Placeholder
        typeCounts: typeResult.reduce((acc, item) => {
          acc[item.typeId] = item.count;
          return acc;
        }, {}),
        cityCounts: cityResult.reduce((acc, item) => {
          acc[item.city] = item.count;
          return acc;
        }, {}),
        clusterCounts: clusterResult.reduce((acc, item) => {
          acc[item.cluster] = item.count;
          return acc;
        }, {}),
        managerCounts: managerResult.reduce((acc, item) => {
          acc[item.manager_name] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
