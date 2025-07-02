
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const cacheService = require('../services/cacheService');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied',
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to get user from cache first
    let user = cacheService.getUser(decoded.userId);
    
    if (!user) {
      user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid token',
          message: 'User not found' 
        });
      }
      
      // Cache the user data
      cacheService.setUser(decoded.userId, user);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token is malformed' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Please login again' 
      });
    }
    
    res.status(500).json({ 
      error: 'Authentication failed',
      message: 'Internal server error' 
    });
  }
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Insufficient privileges',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'User not authenticated'
      });
    }

    try {
      const userPermissions = await User.getUserPermissions(req.user.id);
      const hasPermission = userPermissions.some(p => p.permission_name === permission);
      
      if (!hasPermission) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Missing required permission',
          required: permission
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
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
