
const express = require('express');
const authController = require('../controllers/authController');
const { authValidators } = require('../utils/validators');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Login endpoint
router.post('/login', authValidators.login, authController.login);

// Get current user
router.get('/me', authenticateToken, authController.getCurrentUser);

// Refresh token
router.post('/refresh', authenticateToken, authController.refreshToken);

module.exports = router;
