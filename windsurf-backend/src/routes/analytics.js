
const express = require('express');
const database = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// All analytics routes require admin/support access
router.use(authenticateToken);
router.use(authorizeRoles('admin', 'support'));

// Dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const queries = {
      totalIssues: 'SELECT COUNT(*) as count FROM issues',
      openIssues: "SELECT COUNT(*) as count FROM issues WHERE status = 'open'",
      inProgressIssues: "SELECT COUNT(*) as count FROM issues WHERE status = 'in_progress'",
      resolvedIssues: "SELECT COUNT(*) as count FROM issues WHERE status IN ('resolved', 'closed')",
      
      // Issues by status
      statusBreakdown: `
        SELECT status, COUNT(*) as count 
        FROM issues 
        GROUP BY status
      `,
      
      // Issues by priority
      priorityBreakdown: `
        SELECT priority, COUNT(*) as count 
        FROM issues 
        GROUP BY priority
      `,
      
      // Recent issues
      recentIssues: `
        SELECT 
          i.id, i.type_id, i.sub_type_id, i.status, i.priority, i.created_at,
          u.name as employee_name, u.city, u.cluster
        FROM issues i
        LEFT JOIN dashboard_users u ON i.employee_uuid = u.id
        ORDER BY i.created_at DESC 
        LIMIT 10
      `
    };

    const results = {};
    
    for (const [key, query] of Object.entries(queries)) {
      try {
        results[key] = await database.query(query);
      } catch (error) {
        console.error(`Error in ${key} query:`, error);
        results[key] = [];
      }
    }

    const analytics = {
      overview: {
        totalIssues: results.totalIssues[0]?.count || 0,
        openIssues: results.openIssues[0]?.count || 0,
        inProgressIssues: results.inProgressIssues[0]?.count || 0,
        resolvedIssues: results.resolvedIssues[0]?.count || 0
      },
      statusBreakdown: results.statusBreakdown,
      priorityBreakdown: results.priorityBreakdown,
      recentIssues: results.recentIssues
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
