
const db = require('../config/database');

// Role hierarchy and permissions
const ROLE_HIERARCHY = {
  'admin': ['admin', 'security-admin', 'agent', 'employee'],
  'security-admin': ['security-admin', 'agent', 'employee'],
  'agent': ['agent', 'employee'],
  'employee': ['employee']
};

const PERMISSIONS = {
  // Issue permissions
  'issues:create': ['admin', 'security-admin', 'agent', 'employee'],
  'issues:view_own': ['admin', 'security-admin', 'agent', 'employee'],
  'issues:view_all': ['admin', 'security-admin', 'agent'],
  'issues:update': ['admin', 'security-admin', 'agent'],
  'issues:delete': ['admin'],
  'issues:assign': ['admin', 'security-admin', 'agent'],
  
  // Comment permissions
  'comments:create': ['admin', 'security-admin', 'agent', 'employee'],
  'comments:view': ['admin', 'security-admin', 'agent', 'employee'],
  'comments:internal': ['admin', 'security-admin', 'agent'],
  
  // User management permissions
  'users:create': ['admin'],
  'users:view': ['admin', 'security-admin'],
  'users:update': ['admin'],
  'users:delete': ['admin'],
  
  // Analytics permissions
  'analytics:view': ['admin', 'security-admin'],
  'analytics:export': ['admin', 'security-admin'],
  
  // Feedback permissions
  'feedback:view': ['admin', 'security-admin'],
  'feedback:analytics': ['admin', 'security-admin']
};

// Check if user has permission
const hasPermission = (userRole, permission) => {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles && allowedRoles.includes(userRole);
};

// Check if user can access higher role
const canAccessRole = (userRole, targetRole) => {
  const accessibleRoles = ROLE_HIERARCHY[userRole];
  return accessibleRoles && accessibleRoles.includes(targetRole);
};

// Middleware to check permissions
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission,
        userRole: req.user.role
      });
    }
    
    next();
  };
};

// Middleware to check resource ownership
const requireOwnership = (getResourceOwner) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Admin and security-admin can access everything
      if (['admin', 'security-admin'].includes(req.user.role)) {
        return next();
      }
      
      const ownerId = await getResourceOwner(req);
      
      if (ownerId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied - resource not owned by user' });
      }
      
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

// Get issue owner helper
const getIssueOwner = async (req) => {
  const { id } = req.params;
  const [issues] = await db.execute('SELECT employee_uuid FROM issues WHERE id = ?', [id]);
  return issues.length > 0 ? issues[0].employee_uuid : null;
};

// Middleware combinations
const requireIssueAccess = requireOwnership(getIssueOwner);

// Dynamic permission checker for complex scenarios
const checkDynamicPermission = (permissionChecker) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const hasAccess = await permissionChecker(req.user, req);
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      next();
    } catch (error) {
      console.error('Dynamic permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

module.exports = {
  hasPermission,
  canAccessRole,
  requirePermission,
  requireOwnership,
  requireIssueAccess,
  checkDynamicPermission,
  getIssueOwner,
  PERMISSIONS,
  ROLE_HIERARCHY
};
