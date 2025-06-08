
const rbacService = require('../services/rbacService');

// Check if user has required role
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const userRoles = await rbacService.getUserRoles(userId);
      
      const hasRequiredRole = userRoles.some(role => 
        allowedRoles.includes(role.name)
      );
      
      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          required: allowedRoles,
          current: userRoles.map(r => r.name)
        });
      }
      
      req.user.roles = userRoles;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
};

// Check if user has required permission
const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const hasPermission = await rbacService.userHasPermission(userId, permissionName);
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          required: permissionName
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

// Check if user can access resource (owns it or has admin role)
const requireOwnershipOrRole = (roles = ['admin']) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const resourceUserId = req.params.userId || req.body.userId;
      
      // If user owns the resource
      if (userId === resourceUserId) {
        return next();
      }
      
      // Check if user has required role
      const userRoles = await rbacService.getUserRoles(userId);
      const hasRequiredRole = userRoles.some(role => 
        roles.includes(role.name)
      );
      
      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          error: 'Access denied - insufficient permissions'
        });
      }
      
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        error: 'Access check failed'
      });
    }
  };
};

module.exports = {
  requireRole,
  requirePermission,
  requireOwnershipOrRole
};
