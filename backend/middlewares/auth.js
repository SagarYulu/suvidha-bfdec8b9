
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT, HTTP_STATUS } = require('../config/constants');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, JWT.SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Invalid token'
      });
    }

    if (!user.is_active) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Remove password from user object
    const { password_hash, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
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
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Authentication required'
      });
    }

    try {
      const userPermissions = await User.getUserPermissions(req.user.id);
      
      if (!userPermissions.includes(permission)) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission
};
