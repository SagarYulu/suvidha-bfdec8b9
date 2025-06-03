
const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', [authenticateToken, authorizeRoles('admin', 'hr')], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (startDate && endDate) {
      dateFilter = ' AND DATE(created_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Total issues
    const [totalResult] = await db.execute(
      `SELECT COUNT(*) as total FROM issues WHERE 1=1${dateFilter}`,
      params
    );

    // Issues by status
    const [statusResult] = await db.execute(
      `SELECT status, COUNT(*) as count FROM issues WHERE 1=1${dateFilter} GROUP BY status`,
      params
    );

    // Issues by priority
    const [priorityResult] = await db.execute(
      `SELECT priority, COUNT(*) as count FROM issues WHERE 1=1${dateFilter} GROUP BY priority`,
      params
    );

    // Recent issues
    const [recentIssues] = await db.execute(
      `SELECT i.id, i.description, i.status, i.priority, i.created_at, e.name as employee_name
       FROM issues i
       LEFT JOIN employees e ON i.employee_uuid = e.id
       WHERE 1=1${dateFilter}
       ORDER BY i.created_at DESC
       LIMIT 10`,
      params
    );

    res.json({
      totalIssues: totalResult[0].total,
      issuesByStatus: statusResult,
      issuesByPriority: priorityResult,
      recentIssues
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

module.exports = router;
