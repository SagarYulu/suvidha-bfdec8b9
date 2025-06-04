
const authService = require('../services/authService');
const { validationResult } = require('express-validator');

class AuthController {
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      if (!result.success) {
        return res.status(401).json({ 
          error: 'Authentication failed',
          message: result.message 
        });
      }
      
      res.json({
        success: true,
        token: result.token,
        user: result.user,
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        error: 'Authentication failed',
        message: error.message 
      });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const user = await authService.getUserById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ success: true, user });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user data',
        message: error.message 
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const { token } = req.body;
      const result = await authService.refreshToken(token);
      
      if (!result.success) {
        return res.status(401).json({ 
          error: 'Token refresh failed',
          message: result.message 
        });
      }
      
      res.json({
        success: true,
        token: result.token,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ 
        error: 'Token refresh failed',
        message: error.message 
      });
    }
  }

  async logout(req, res) {
    try {
      // Implement logout logic (e.g., blacklist token)
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        error: 'Logout failed',
        message: error.message 
      });
    }
  }
}

module.exports = new AuthController();
