
const AuthService = require('../services/AuthService');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  async register(req, res) {
    try {
      const result = await AuthService.register(req.body);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async verify(req, res) {
    try {
      const result = await AuthService.verifyUser(req.user.id);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  async logout(req, res) {
    // For JWT, logout is handled on the client side
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}

module.exports = new AuthController();
