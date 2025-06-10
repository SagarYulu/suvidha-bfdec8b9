
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/database');
const { HTTP_STATUS } = require('../config/constants');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details from database
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, email, role, is_active FROM dashboard_users WHERE id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    const user = rows[0];
    
    if (!user.is_active) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'Account deactivated',
        message: 'Your account has been deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'Invalid token',
        message: 'Token is malformed'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'Token expired',
        message: 'Please login again'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Authentication error',
      message: 'Internal server error'
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'Authentication required',
        message: 'Please login first'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: 'Insufficient permissions',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: 'Authentication required',
          message: 'Please login first'
        });
      }

      const pool = getPool();
      const [rows] = await pool.execute(`
        SELECT p.permission_name 
        FROM rbac_user_roles ur
        JOIN rbac_role_permissions rp ON ur.role_id = rp.role_id
        JOIN rbac_permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = ? AND p.permission_name = ?
      `, [req.user.id, permission]);

      if (rows.length === 0) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          error: 'Insufficient permissions',
          message: `Access denied. Required permission: ${permission}`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Permission check failed',
        message: 'Internal server error'
      });
    }
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission
};
