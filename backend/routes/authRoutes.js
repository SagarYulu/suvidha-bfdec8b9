
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const { validationRules, handleValidationErrors } = require('../middlewares/validation');

// Public routes with enhanced role validation
router.post('/login', 
  validationRules.login,
  handleValidationErrors,
  authController.login
);

router.post('/register',
  validationRules.register,
  handleValidationErrors,
  authController.register
);

router.post('/forgot-password',
  validationRules.forgotPassword,
  handleValidationErrors,
  authController.forgotPassword
);

router.post('/reset-password',
  validationRules.resetPassword,
  handleValidationErrors,
  authController.resetPassword
);

// Protected routes
router.use(authenticateToken);

router.get('/me', authController.getCurrentUser);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);
router.post('/change-password',
  validationRules.changePassword,
  handleValidationErrors,
  authController.changePassword
);

module.exports = router;
