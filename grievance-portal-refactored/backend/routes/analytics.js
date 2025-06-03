
const express = require('express');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', authenticateToken, authorizeRoles('admin', 'support'), (req, res) => {
  try {
    const queries = {
      totalIssues: 'SELECT COUNT(*) as total FROM issues',
      openIssues: "SELECT COUNT(*) as total FROM issues WHERE status = 'open'",
      resolvedIssues: "SELECT COUNT(*) as total FROM issues WHERE status IN ('resolved', 'closed')",
      
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
      
      // Issues by type
      typeBreakdown: `
        SELECT type_id, COUNT(*) as count 
        FROM issues 
        GROUP BY type_id 
        ORDER BY count DESC
      `,
      
      // Issues by city
      cityBreakdown: `
        SELECT e.city, COUNT(i.id) as count 
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE e.city IS NOT NULL
        GROUP BY e.city 
        ORDER BY count DESC
      `,
      
      // Recent issues
      recentIssues: `
        SELECT 
          i.id, i.type_id, i.sub_type_id, i.status, i.priority, i.created_at,
          e.name as employee_name, e.city, e.cluster
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        ORDER BY i.created_at DESC 
        LIMIT 10
      `,
      
      // Resolution time analytics
      avgResolutionTime: `
        SELECT 
          AVG(TIMESTAMPDIFF(HOUR, created_at, closed_at)) as avg_hours
        FROM issues 
        WHERE closed_at IS NOT NULL
      `,
      
      // Monthly trends
      monthlyTrends: `
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as count
        FROM issues
        WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month
      `
    };

    const results = {};
    let completedQueries = 0;
    const totalQueries = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
      db.query(query, (err, result) => {
        if (err) {
          console.error(`Error in ${key} query:`, err);
          results[key] = [];
        } else {
          results[key] = result;
        }

        completedQueries++;
        
        if (completedQueries === totalQueries) {
          // Process results
          const analytics = {
            overview: {
              totalIssues: results.totalIssues[0]?.total || 0,
              openIssues: results.openIssues[0]?.total || 0,
              resolvedIssues: results.resolvedIssues[0]?.total || 0,
              avgResolutionTime: Math.round(results.avgResolutionTime[0]?.avg_hours || 0)
            },
            statusBreakdown: results.statusBreakdown,
            priorityBreakdown: results.priorityBreakdown,
            typeBreakdown: results.typeBreakdown,
            cityBreakdown: results.cityBreakdown,
            recentIssues: results.recentIssues,
            monthlyTrends: results.monthlyTrends
          };

          res.json({
            success: true,
            analytics
          });
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user-specific analytics
router.get('/user/:id', authenticateToken, (req, res) => {
  try {
    const userId = req.params.id;
    const requestingUserId = req.user.id;
    const userRole = req.user.role;

    // Users can only view their own analytics unless they're admin/support
    if (userId !== requestingUserId && !['admin', 'support'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const queries = {
      totalIssues: 'SELECT COUNT(*) as total FROM issues WHERE employee_uuid = ?',
      openIssues: "SELECT COUNT(*) as total FROM issues WHERE employee_uuid = ? AND status = 'open'",
      resolvedIssues: "SELECT COUNT(*) as total FROM issues WHERE employee_uuid = ? AND status IN ('resolved', 'closed')",
      
      statusBreakdown: `
        SELECT status, COUNT(*) as count 
        FROM issues 
        WHERE employee_uuid = ?
        GROUP BY status
      `,
      
      recentIssues: `
        SELECT id, type_id, sub_type_id, status, priority, created_at
        FROM issues
        WHERE employee_uuid = ?
        ORDER BY created_at DESC 
        LIMIT 5
      `
    };

    const results = {};
    let completedQueries = 0;
    const totalQueries = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
      db.query(query, [userId], (err, result) => {
        if (err) {
          console.error(`Error in ${key} query:`, err);
          results[key] = [];
        } else {
          results[key] = result;
        }

        completedQueries++;
        
        if (completedQueries === totalQueries) {
          const analytics = {
            overview: {
              totalIssues: results.totalIssues[0]?.total || 0,
              openIssues: results.openIssues[0]?.total || 0,
              resolvedIssues: results.resolvedIssues[0]?.total || 0
            },
            statusBreakdown: results.statusBreakdown,
            recentIssues: results.recentIssues
          };

          res.json({
            success: true,
            analytics
          });
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
