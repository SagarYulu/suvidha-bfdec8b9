
const express = require('express');
const router = express.Router();
const rbacController = require('../controllers/rbacController');
const auth = require('../middleware/auth');

// Get user permissions
router.get('/users/:userId/permissions', auth, rbacController.getUserPermissions);

// Get user roles
router.get('/users/:userId/roles', auth, rbacController.getUserRoles);

// Assign role to user
router.post('/assign-role', auth, rbacController.assignRole);

// Remove role from user
router.post('/remove-role', auth, rbacController.removeRole);

// Get all roles
router.get('/roles', auth, rbacController.getAllRoles);

// Get all permissions
router.get('/permissions', auth, rbacController.getAllPermissions);

module.exports = router;
