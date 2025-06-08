
const rbacService = require('../services/rbacService');

class RBACMiddleware {
  static requireRole(roles) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            error: 'Authentication required'
          });
        }

        const userRoles = Array.isArray(roles) ? roles : [roles];
        const hasRole = await rbacService.userHasAnyRole(req.user.id, userRoles);

        if (!hasRole) {
          return res.status(403).json({
            success: false,
            error: 'Insufficient permissions',
            required: userRoles
          });
        }

        next();
      } catch (error) {
        console.error('RBAC role check error:', error);
        res.status(500).json({
          success: false,
          error: 'Permission check failed'
        });
      }
    };
  }

  static requirePermission(permission) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasPermission = await rbacService.userHasPermission(req.user.id, permission);

        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            error: 'Insufficient permissions',
            required: permission
          });
        }

        next();
      } catch (error) {
        console.error('RBAC permission check error:', error);
        res.status(500).json({
          success: false,
          error: 'Permission check failed'
        });
      }
    };
  }

  static requireAnyPermission(permissions) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasAnyPermission = await rbacService.userHasAnyPermission(req.user.id, permissions);

        if (!hasAnyPermission) {
          return res.status(403).json({
            success: false,
            error: 'Insufficient permissions',
            required: permissions
          });
        }

        next();
      } catch (error) {
        console.error('RBAC permission check error:', error);
        res.status(500).json({
          success: false,
          error: 'Permission check failed'
        });
      }
    };
  }

  static requireOwnership(resourceType) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            error: 'Authentication required'
          });
        }

        const resourceId = req.params.id;
        const isOwner = await rbacService.checkResourceOwnership(req.user.id, resourceType, resourceId);

        if (!isOwner) {
          // Check if user has admin role as fallback
          const isAdmin = await rbacService.userHasRole(req.user.id, 'admin');
          if (!isAdmin) {
            return res.status(403).json({
              success: false,
              error: 'Access denied - resource ownership required'
            });
          }
        }

        next();
      } catch (error) {
        console.error('RBAC ownership check error:', error);
        res.status(500).json({
          success: false,
          error: 'Ownership check failed'
        });
      }
    };
  }
}

module.exports = RBACMiddleware;
