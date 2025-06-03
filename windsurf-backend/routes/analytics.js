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
      whereClause += ' AND i.type_id = ?';
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
      SELECT COUNT(*) as total
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.employee_uuid
      ${whereClause}
    `, params);

    // Resolved issues
    const [resolvedResult] = await pool.execute(`
      SELECT COUNT(*) as resolved
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.employee_uuid
      ${whereClause} AND i.status IN ('resolved', 'closed')
    `, params);

    // Open issues
    const [openResult] = await pool.execute(`
      SELECT COUNT(*) as open
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.employee_uuid
      ${whereClause} AND i.status = 'open'
    `, params);

    // Type counts
    const [typeResults] = await pool.execute(`
      SELECT i.type_id, COUNT(*) as count
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.employee_uuid
      ${whereClause}
      GROUP BY i.type_id
    `, params);

    // City counts
    const [cityResults] = await pool.execute(`
      SELECT e.city, COUNT(*) as count
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.employee_uuid
      ${whereClause}
      GROUP BY e.city
    `, params);

    const totalIssues = totalResult[0].total;
    const resolvedIssues = resolvedResult[0].resolved;
    const openIssues = openResult[0].open;

    const analytics = {
      totalIssues,
      resolvedIssues,
      openIssues,
      resolutionRate: totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) : 0,
      avgResolutionTime: 2.5, // Mock data
      avgFirstResponseTime: 1.2, // Mock data
      typeCounts: typeResults.reduce((acc, item) => {
        acc[item.type_id] = item.count;
        return acc;
      }, {}),
      cityCounts: cityResults.reduce((acc, item) => {
        acc[item.city] = item.count;
        return acc;
      }, {}),
      clusterCounts: {}, // Mock data
      managerCounts: {} // Mock data
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
