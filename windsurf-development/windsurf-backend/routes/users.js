
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { 
  validateCreateUser, 
  validateUpdateUser, 
  validateUUIDParam,
  handleValidationErrors 
} = require('../middleware/validation');

// All user routes require authentication
router.use(authenticateToken);

// Get all users (admin/manager only)
router.get('/', requireRole(['admin', 'manager']), userController.getUsers);

// Get single user
router.get('/:id', validateUUIDParam('id'), handleValidationErrors, userController.getUser);

// Create user (admin only)
router.post('/', requireRole(['admin']), validateCreateUser, handleValidationErrors, userController.createUser);

// Update user (admin only)
router.put('/:id', requireRole(['admin']), validateUUIDParam('id'), validateUpdateUser, handleValidationErrors, userController.updateUser);

// Delete user (admin only)
router.delete('/:id', requireRole(['admin']), validateUUIDParam('id'), handleValidationErrors, userController.deleteUser);

module.exports = router;
