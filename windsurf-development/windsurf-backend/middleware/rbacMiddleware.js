
const rbacService = require('../services/rbacService');

// Enhanced RBAC middleware with permission checking
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Authentication required' 
        });
      }

      const hasPermission = await rbacService.hasPermission(req.user.id, permission);
      
      if (!hasPermission) {
        return res.status(403).json({ 
          success: false,
          error: 'Insufficient permissions',
          required: permission,
          userRole: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Authorization check failed' 
      });
    }
  };
};

// Role-based middleware
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Authentication required' 
        });
      }

      const userRoles = await rbacService.getUserRoles(req.user.id);
      const userRoleNames = userRoles.map(role => role.name);
      
      const hasRole = roles.some(role => userRoleNames.includes(role));
      
      if (!hasRole) {
        return res.status(403).json({ 
          success: false,
          error: 'Insufficient role permissions',
          required: roles,
          userRoles: userRoleNames
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Role check failed' 
      });
    }
  };
};

// Resource ownership middleware
const requireOwnership = (getResourceOwner) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Authentication required' 
        });
      }

      // Admin users can access everything
      const userRoles = await rbacService.getUserRoles(req.user.id);
      const isAdmin = userRoles.some(role => ['admin', 'super_admin'].includes(role.name));
      
      if (isAdmin) {
        return next();
      }

      const ownerId = await getResourceOwner(req);
      
      if (ownerId !== req.user.id) {
        return res.status(403).json({ 
          success: false,
          error: 'Access denied - resource not owned by user' 
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Ownership check failed' 
      });
    }
  };
};

module.exports = {
  requirePermission,
  requireRole,
  requireOwnership
};
