const authService = require('../services/authService');
const { validationResult } = require('express-validator');

const authController = {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await authService.registerUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await authService.loginUser(req.body);
      res.json(result);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message });
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
      console.error('Verify error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async employeeLogin(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await authService.loginEmployee(req.body);
      res.json(result);
    } catch (error) {
      console.error('Employee login error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = authController;
