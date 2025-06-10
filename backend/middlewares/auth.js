
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const cacheService = require('../services/cacheService');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to get user from cache first
    let user = cacheService.getUser(decoded.id);
    
    if (!user) {
      user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'Invalid token.' });
      }
      
      // Cache the user data
      cacheService.setUser(decoded.id, user);
    }

    // Get permissions from cache or database
    let permissions = cacheService.getUserPermissions(decoded.id);
    if (!permissions) {
      permissions = await User.getUserPermissions(decoded.id);
      cacheService.setUserPermissions(decoded.id, permissions);
    }

    req.user = {
      ...user,
      permissions: permissions,
      isSpecialAdmin: decoded.isSpecialAdmin || false
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Access denied. User not authenticated.' });
    }

    // Special admin accounts have access to everything
    if (req.user.isSpecialAdmin) {
      return next();
    }

    // Check if user has required role
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient privileges.',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Access denied. User not authenticated.' });
    }

    // Special admin accounts have all permissions
    if (req.user.isSpecialAdmin) {
      return next();
    }

    // Check if user has the specific permission
    const hasPermission = req.user.permissions?.some(p => p.permission_name === permission);
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Access denied. Missing required permission.',
        required: permission
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  checkPermission
};
