
const express = require('express');
const rbacController = require('../controllers/rbacController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get user permissions
router.get('/users/:userId/permissions', 
  authenticateToken, 
  requireRole(['admin', 'super-admin']), 
  rbacController.getUserPermissions
);

// Get user roles
router.get('/users/:userId/roles', 
  authenticateToken, 
  requireRole(['admin', 'super-admin']), 
  rbacController.getUserRoles
);

// Assign role to user
router.post('/assign-role', 
  authenticateToken, 
  requireRole(['admin', 'super-admin']), 
  rbacController.assignRole
);

// Remove role from user
router.post('/remove-role', 
  authenticateToken, 
  requireRole(['admin', 'super-admin']), 
  rbacController.removeRole
);

// Get all roles
router.get('/roles', 
  authenticateToken, 
  requireRole(['admin', 'super-admin']), 
  rbacController.getAllRoles
);

// Get all permissions
router.get('/permissions', 
  authenticateToken, 
  requireRole(['admin', 'super-admin']), 
  rbacController.getAllPermissions
);

module.exports = router;
