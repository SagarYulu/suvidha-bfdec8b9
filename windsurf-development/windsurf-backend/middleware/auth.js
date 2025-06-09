
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const UserModel = require('../models/User');
const EmployeeModel = require('../models/Employee');
const { errorResponse } = require('../utils/responseHelper');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return errorResponse(res, 'Access token required', 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Try to find user in dashboard_users first, then employees
    let user = await UserModel.findById(decoded.userId);
    if (!user) {
      user = await EmployeeModel.findById(decoded.userId);
    }

    if (!user) {
      return errorResponse(res, 'User not found', 401);
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role || user.role,
      ...user
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401);
    }
    
    console.error('Auth middleware error:', error);
    return errorResponse(res, 'Authentication failed', 401);
  }
};

const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }

    next();
  };
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    // Basic permission check - can be extended with more complex RBAC
    const userRole = req.user?.role;
    
    const permissions = {
      'admin': ['*'], // Admin has all permissions
      'manager': ['issues:read', 'issues:update', 'issues:assign', 'users:read'],
      'agent': ['issues:read', 'issues:update', 'issues:assign'],
      'employee': ['issues:read', 'issues:create']
    };

    const userPermissions = permissions[userRole] || [];
    
    if (userPermissions.includes('*') || userPermissions.includes(permission)) {
      return next();
    }

    return errorResponse(res, 'Permission denied', 403);
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission
};
