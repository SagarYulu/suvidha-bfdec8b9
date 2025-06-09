
const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');
const EmployeeModel = require('../models/Employee');
const config = require('../config/env');

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
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Verify user still exists
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    req.user = user;
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
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // For mobile, check employees table
    const employee = await EmployeeModel.findById(decoded.userId);
    if (!employee) {
      return res.status(401).json({ 
        success: false,
        error: 'Employee not found' 
      });
    }

    req.user = employee;
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

const authenticateAdmin = async (req, res, next) => {
  await authenticateToken(req, res, () => {
    if (req.user && ['admin', 'manager'].includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
  });
};

module.exports = {
  authenticateToken,
  authenticateMobile,
  requireRole,
  authenticateAdmin
};
