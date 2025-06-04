
const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

// Validation middleware
const userValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['admin', 'manager', 'support', 'employee']).withMessage('Invalid role'),
  body('status').optional().isIn(['active', 'inactive', 'pending']).withMessage('Invalid status')
];

const userCreationValidation = [
  ...userValidation,
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Get all users with pagination and filtering
router.get('/', 
  authenticateToken, 
  requireRole(['admin', 'manager']), 
  userController.getUsers
);

// Get single user
router.get('/:id', 
  authenticateToken, 
  userController.getUser
);

// Create new user
router.post('/', 
  authenticateToken, 
  requireRole(['admin']), 
  userCreationValidation,
  userController.createUser
);

// Update user
router.put('/:id', 
  authenticateToken, 
  requireRole(['admin', 'manager']),
  userValidation,
  userController.updateUser
);

// Delete user (soft delete)
router.delete('/:id', 
  authenticateToken, 
  requireRole(['admin']), 
  userController.deleteUser
);

module.exports = router;
