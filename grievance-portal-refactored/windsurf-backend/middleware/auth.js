
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Authenticate JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    const [users] = await db.execute(
      'SELECT id, email, role, name FROM dashboard_users WHERE id = ? AND password IS NOT NULL',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = {
      id: users[0].id,
      email: users[0].email,
      role: users[0].role,
      name: users[0].name
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Role-based access control
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: userRole
      });
    }

    next();
  };
};

// Permission-based access control
const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      // Check if user has the required permission through their role
      const [permissions] = await db.execute(`
        SELECT p.name 
        FROM rbac_permissions p
        JOIN rbac_role_permissions rp ON p.id = rp.permission_id
        JOIN rbac_roles r ON rp.role_id = r.id
        JOIN rbac_user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = ? AND p.name = ?
      `, [req.user.id, permission]);

      if (permissions.length === 0) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permission
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission
};
