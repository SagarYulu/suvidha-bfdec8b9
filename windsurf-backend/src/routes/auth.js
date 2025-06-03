
const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/login', validateRequest(schemas.login), AuthController.login);
router.post('/register', validateRequest(schemas.createUser), AuthController.register);

// Protected routes
router.get('/verify', authenticateToken, AuthController.verify);
router.post('/logout', authenticateToken, AuthController.logout);

module.exports = router;
