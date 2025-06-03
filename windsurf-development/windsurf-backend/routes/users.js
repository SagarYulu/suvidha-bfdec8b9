
const express = require('express');
const userController = require('../controllers/userController');
const { userValidators } = require('../utils/validators');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/', authenticateToken, requirePermission('manage:users'), userController.getUsers);

// Get single user
router.get('/:id', authenticateToken, userController.getUser);

// Create new user
router.post('/', authenticateToken, requirePermission('manage:users'), userValidators.create, userController.createUser);

// Update user
router.put('/:id', authenticateToken, requirePermission('manage:users'), userController.updateUser);

// Delete user
router.delete('/:id', authenticateToken, requirePermission('manage:users'), userController.deleteUser);

module.exports = router;
