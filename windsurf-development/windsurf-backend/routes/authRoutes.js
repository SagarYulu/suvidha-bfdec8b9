
const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

// Admin login
router.post('/login',
  ValidationMiddleware.validateLogin(),
  ValidationMiddleware.handleValidationErrors,
  authController.login
);

// Mobile login for employees
router.post('/mobile-login',
  ValidationMiddleware.validateMobileLogin(),
  ValidationMiddleware.handleValidationErrors,
  authController.mobileLogin
);

// Logout
router.post('/logout',
  authenticateToken,
  authController.logout
);

// Refresh token
router.post('/refresh',
  authenticateToken,
  authController.refreshToken
);

// Get current user profile
router.get('/profile',
  authenticateToken,
  authController.getProfile
);

// Update user profile
router.put('/profile',
  authenticateToken,
  ValidationMiddleware.validateProfileUpdate(),
  ValidationMiddleware.handleValidationErrors,
  authController.updateProfile
);

// Change password
router.post('/change-password',
  authenticateToken,
  ValidationMiddleware.validatePasswordChange(),
  ValidationMiddleware.handleValidationErrors,
  authController.changePassword
);

// Verify token (for frontend auth checks)
router.get('/verify',
  authenticateToken,
  authController.verifyToken
);

module.exports = router;
