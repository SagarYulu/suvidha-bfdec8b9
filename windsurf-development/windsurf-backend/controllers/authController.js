
const authService = require('../services/authService');
const { validationResult } = require('express-validator');

class AuthController {
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      res.json(result);
    } catch (error) {
      console.error('Login controller error:', error);
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      res.json({ user });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  }

  async refreshToken(req, res) {
    try {
      const token = authService.generateToken(req.user);
      res.json({ token });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ error: 'Token refresh failed' });
    }
  }
}

module.exports = new AuthController();
