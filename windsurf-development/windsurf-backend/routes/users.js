
const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

// Validation middleware
const userValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').notEmpty().withMessage('Role is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const userUpdateValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('role').optional().notEmpty().withMessage('Role cannot be empty'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Bulk user validation
const bulkUserValidation = [
  body('users').isArray().withMessage('Users must be an array'),
  body('users.*.name').notEmpty().withMessage('Name is required for all users'),
  body('users.*.email').isEmail().withMessage('Valid email is required for all users'),
  body('users.*.role').notEmpty().withMessage('Role is required for all users')
];

// Get all users with filtering and pagination
router.get('/', 
  authenticateToken, 
  requireRole(['admin', 'security-admin', 'manager']),
  userController.getUsers
);

// Get single user
router.get('/:id', 
  authenticateToken, 
  requireRole(['admin', 'security-admin', 'manager']),
  userController.getUser
);

// Create new user
router.post('/', 
  authenticateToken, 
  requireRole(['admin', 'security-admin']),
  userValidation,
  userController.createUser
);

// Update user
router.put('/:id', 
  authenticateToken, 
  requireRole(['admin', 'security-admin']),
  userUpdateValidation,
  userController.updateUser
);

// Delete user
router.delete('/:id', 
  authenticateToken, 
  requireRole(['admin', 'security-admin']), 
  userController.deleteUser
);

// Bulk create users
router.post('/bulk',
  authenticateToken,
  requireRole(['admin', 'security-admin']),
  bulkUserValidation,
  userController.bulkCreateUsers
);

// Validate bulk users
router.post('/validate-bulk',
  authenticateToken,
  requireRole(['admin', 'security-admin']),
  body('users').isArray().withMessage('Users must be an array'),
  userController.validateBulkUsers
);

module.exports = router;
