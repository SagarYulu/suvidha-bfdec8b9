
const express = require('express');
const UserController = require('../controllers/UserController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get current user profile
router.get('/profile', UserController.getCurrentUser);

// Admin-only routes
router.get('/', authorizeRoles('admin'), UserController.getUsers);
router.post('/', authorizeRoles('admin'), validateRequest(schemas.createUser), UserController.createUser);
router.get('/:id', authorizeRoles('admin'), UserController.getUserById);
router.put('/:id', authorizeRoles('admin'), validateRequest(schemas.updateUser), UserController.updateUser);
router.delete('/:id', authorizeRoles('admin'), UserController.deleteUser);

module.exports = router;
