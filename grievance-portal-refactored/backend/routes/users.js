
const express = require('express');
const { body } = require('express-validator');
const usersController = require('../controllers/usersController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), usersController.getUsers);

// Get all employees
router.get('/employees', authenticateToken, authorizeRoles('admin', 'support'), usersController.getEmployees);

// Get single user
router.get('/:id', authenticateToken, usersController.getUserById);

// Create new user (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('role').isIn(['employee', 'admin', 'support'])
], usersController.createUser);

// Update user
router.put('/:id', authenticateToken, [
  body('email').optional().isEmail().normalizeEmail(),
  body('name').optional().notEmpty().trim(),
  body('role').optional().isIn(['employee', 'admin', 'support'])
], usersController.updateUser);

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), usersController.deleteUser);

module.exports = router;
