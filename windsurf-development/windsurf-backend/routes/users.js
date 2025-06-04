
const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users with pagination and filtering
router.get('/', 
  authenticateToken, 
  requireRole(['admin', 'super-admin']), 
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
  requireRole(['admin', 'super-admin']), 
  userController.createUser
);

// Update user
router.put('/:id', 
  authenticateToken, 
  userController.updateUser
);

// Delete user
router.delete('/:id', 
  authenticateToken, 
  requireRole(['admin', 'super-admin']), 
  userController.deleteUser
);

module.exports = router;
