
const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

const router = express.Router();

// Get all users with filtering and pagination
router.get('/', authenticateToken, requireRole(['admin', 'manager']), userController.getUsers);

// Get single user
router.get('/:id', authenticateToken, requireRole(['admin', 'manager']), userController.getUser);

// Create new user
router.post('/', authenticateToken, requireRole(['admin']), userController.createUser);

// Update user
router.put('/:id', authenticateToken, requireRole(['admin']), userController.updateUser);

// Delete user
router.delete('/:id', authenticateToken, requireRole(['admin']), userController.deleteUser);

module.exports = router;
