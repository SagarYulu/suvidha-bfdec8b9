
const express = require('express');
const authController = require('../controllers/authController');
const authService = require('../services/authService');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Mobile login endpoint (Email + Employee ID)
router.post('/mobile/login', 
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('employeeId').notEmpty().withMessage('Employee ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { email, employeeId } = req.body;
      const result = await authService.mobileLogin(email, employeeId);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Mobile login error:', error);
      res.status(401).json({ 
        error: error.message || 'Login failed' 
      });
    }
  }
);

// Admin login endpoint (Email + Password) 
router.post('/admin/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { email, password } = req.body;
      const result = await authService.adminLogin(email, password);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(401).json({ 
        error: error.message || 'Login failed' 
      });
    }
  }
);

// Standard login endpoint
router.post('/login', 
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
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
