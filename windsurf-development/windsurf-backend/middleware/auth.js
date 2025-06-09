
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Verify user still exists in dashboard_users table
    const [users] = await pool.execute(
      'SELECT id, email, name, role, employee_id FROM dashboard_users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired' 
      });
    }
    
    return res.status(403).json({ 
      success: false,
      error: 'Invalid token' 
    });
  }
};

const authenticateMobile = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // For mobile, check employees table
    const [employees] = await pool.execute(
      'SELECT id, emp_id, email, name, role FROM employees WHERE id = ?',
      [decoded.userId]
    );

    if (employees.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: 'Employee not found' 
      });
    }

    req.user = employees[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired' 
      });
    }
    
    return res.status(403).json({ 
      success: false,
      error: 'Invalid token' 
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        error: 'Insufficient permissions' 
      });
    }

    next();
  };
};

const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    try {
      // Check if user has the required permission
      const [permissions] = await pool.execute(`
        SELECT p.name 
        FROM rbac_permissions p
        JOIN rbac_role_permissions rp ON p.id = rp.permission_id
        JOIN rbac_roles r ON rp.role_id = r.id
        JOIN rbac_user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = ? AND p.name = ?
      `, [req.user.id, permission]);

      if (permissions.length === 0) {
        return res.status(403).json({ 
          success: false,
          error: 'Permission denied' 
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

module.exports = {
  authenticateToken,
  authenticateMobile,
  requireRole,
  requirePermission
};
