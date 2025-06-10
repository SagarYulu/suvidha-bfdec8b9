
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validationRules, handleValidationErrors } = require('../middlewares/validation');
const { authenticateToken } = require('../middlewares/auth');

// Public routes
router.post('/login', 
  validationRules.userLogin, 
  handleValidationErrors, 
  authController.login
);

router.post('/register', 
  validationRules.userRegistration, 
  handleValidationErrors, 
  authController.register
);

router.post('/forgot-password', 
  authController.forgotPassword
);

router.post('/reset-password', 
  authController.resetPassword
);

// Protected routes
router.post('/logout', 
  authenticateToken, 
  authController.logout
);

router.get('/me', 
  authenticateToken, 
  authController.getCurrentUser
);

router.post('/change-password', 
  authenticateToken, 
  authController.changePassword
);

router.post('/refresh-token', 
  authenticateToken, 
  authController.refreshToken
);

module.exports = router;
