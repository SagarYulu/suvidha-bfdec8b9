
const { pool } = require('../config/database');

const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const userId = req.user.id;

      // Check if user has the specific permission
      const [permissions] = await pool.execute(`
        SELECT COUNT(*) as count
        FROM user_permissions
        WHERE user_id = ? AND permission_key = ?
      `, [userId, permission]);

      if (permissions[0].count === 0) {
        return res.status(403).json({
          success: false,
          error: `Insufficient permissions. Required: ${permission}`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
};

const checkAnyPermission = (permissionList) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const userId = req.user.id;
      const placeholders = permissionList.map(() => '?').join(',');

      // Check if user has any of the specified permissions
      const [permissions] = await pool.execute(`
        SELECT COUNT(*) as count
        FROM user_permissions
        WHERE user_id = ? AND permission_key IN (${placeholders})
      `, [userId, ...permissionList]);

      if (permissions[0].count === 0) {
        return res.status(403).json({
          success: false,
          error: `Insufficient permissions. Required one of: ${permissionList.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
};

const checkResourceOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const userId = req.user.id;
      const resourceId = req.params.id;

      let query;
      switch (resourceType) {
        case 'issue':
          query = 'SELECT COUNT(*) as count FROM issues WHERE id = ? AND employee_uuid = ?';
          break;
        case 'feedback':
          query = 'SELECT COUNT(*) as count FROM ticket_feedback WHERE id = ? AND employee_uuid = ?';
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid resource type'
          });
      }

      const [result] = await pool.execute(query, [resourceId, userId]);

      if (result[0].count === 0) {
        // Check if user has admin permissions as fallback
        const [adminCheck] = await pool.execute(`
          SELECT COUNT(*) as count
          FROM user_permissions
          WHERE user_id = ? AND permission_key IN ('manage:all', 'admin:access')
        `, [userId]);

        if (adminCheck[0].count === 0) {
          return res.status(403).json({
            success: false,
            error: 'You can only access your own resources'
          });
        }
      }

      next();
    } catch (error) {
      console.error('Resource ownership check error:', error);
      res.status(500).json({
        success: false,
        error: 'Ownership check failed'
      });
    }
  };
};

module.exports = {
  checkPermission,
  checkAnyPermission,
  checkResourceOwnership
};
