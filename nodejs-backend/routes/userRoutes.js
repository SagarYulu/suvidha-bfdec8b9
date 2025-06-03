
const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const userController = require('../controllers/userController');

const router = express.Router();

// Get all users (Admin only)
router.get('/', 
  authenticateToken, 
  authorizeRole(['admin']), 
  userController.getUsers
);

// Create new user (Admin only)
router.post('/', 
  authenticateToken, 
  authorizeRole(['admin']),
  validateRequest(schemas.createUser), 
  userController.createUser
);

// Get user by ID
router.get('/:id', 
  authenticateToken, 
  authorizeRole(['admin', 'manager']), 
  userController.getUserById
);

// Update user
router.put('/:id', 
  authenticateToken, 
  authorizeRole(['admin']), 
  userController.updateUser
);

// Delete user
router.delete('/:id', 
  authenticateToken, 
  authorizeRole(['admin']), 
  userController.deleteUser
);

module.exports = router;
