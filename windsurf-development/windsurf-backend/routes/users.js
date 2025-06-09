
const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { validateCreateUser, validateUpdateUser, handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Get all users (admin/manager only)
router.get('/', authenticateToken, requireRole(['admin', 'manager']), userController.getUsers);

// Get single user by ID (admin/manager only)
router.get('/:id', authenticateToken, requireRole(['admin', 'manager']), userController.getUser);

// Create new user (admin only)
router.post('/', authenticateToken, requireRole(['admin']), validateCreateUser, handleValidationErrors, userController.createUser);

// Update user (admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), validateUpdateUser, handleValidationErrors, userController.updateUser);

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), userController.deleteUser);

module.exports = router;
