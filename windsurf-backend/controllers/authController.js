
const { validationResult } = require('express-validator');
const authService = require('../services/authService');

const authController = {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const result = await authService.registerUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed'
      });
    }
  },

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const result = await authService.loginUser(req.body);
      res.json(result);
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed'
      });
    }
  },

  async employeeLogin(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const result = await authService.loginEmployee(req.body);
      res.json(result);
    } catch (error) {
      console.error('Employee login error:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Employee login failed'
      });
    }
  },

  async verify(req, res) {
    try {
      const user = await authService.verifyUser(req.user.id);
      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        message: 'Token verification failed'
      });
    }
  }
};

module.exports = authController;
