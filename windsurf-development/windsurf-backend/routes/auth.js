
const express = require('express');
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Login endpoint
router.post('/login', 
  loginValidation, 
  authController.login
);

// Get current user
router.get('/me', 
  authenticateToken, 
  authController.getCurrentUser
);

// Refresh token
router.post('/refresh', 
  body('token').notEmpty().withMessage('Token is required'),
  authController.refreshToken
);

// Logout
router.post('/logout', 
  authenticateToken, 
  authController.logout
);

module.exports = router;
