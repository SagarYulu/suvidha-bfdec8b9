
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateLogin, 
  validateMobileLogin, 
  handleValidationErrors 
} = require('../middleware/validation');

// Public routes
router.post('/login', validateLogin, handleValidationErrors, authController.login);
router.post('/mobile-login', validateMobileLogin, handleValidationErrors, authController.mobileLogin);

// Protected routes
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.getProfile);
router.get('/verify', authenticateToken, authController.verifyToken);

module.exports = router;
