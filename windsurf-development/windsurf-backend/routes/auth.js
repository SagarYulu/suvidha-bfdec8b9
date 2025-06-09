
const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const { validateLogin, validateMobileLogin, handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Admin login
router.post('/login', validateLogin, handleValidationErrors, authController.login);

// Mobile login
router.post('/mobile-login', validateMobileLogin, handleValidationErrors, authController.mobileLogin);

// Logout
router.post('/logout', authController.logout);

// Refresh token
router.post('/refresh', authenticateToken, authController.refreshToken);

// Get current user profile
router.get('/profile', authenticateToken, authController.getProfile);

// Verify token
router.get('/verify', authenticateToken, authController.verifyToken);

module.exports = router;
