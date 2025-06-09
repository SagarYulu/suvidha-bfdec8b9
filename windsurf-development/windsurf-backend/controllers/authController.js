
const AuthService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      
      successResponse(res, result, 'Login successful');
    } catch (error) {
      console.error('Login error:', error);
      errorResponse(res, error.message, 401);
    }
  }

  async mobileLogin(req, res) {
    try {
      const { email, employeeId } = req.body;
      const result = await AuthService.mobileLogin(email, employeeId);
      
      successResponse(res, result, 'Mobile login successful');
    } catch (error) {
      console.error('Mobile login error:', error);
      errorResponse(res, error.message, 401);
    }
  }

  async logout(req, res) {
    try {
      // JWT is stateless, so logout is handled client-side
      successResponse(res, null, 'Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      errorResponse(res, error.message);
    }
  }

  async refreshToken(req, res) {
    try {
      const newToken = AuthService.generateToken(req.user);
      successResponse(res, { token: newToken }, 'Token refreshed successfully');
    } catch (error) {
      console.error('Token refresh error:', error);
      errorResponse(res, error.message);
    }
  }

  async getProfile(req, res) {
    try {
      const profile = await AuthService.getProfile(req.user.id);
      successResponse(res, { user: profile }, 'Profile retrieved successfully');
    } catch (error) {
      console.error('Get profile error:', error);
      errorResponse(res, error.message);
    }
  }

  async verifyToken(req, res) {
    try {
      successResponse(res, { user: req.user }, 'Token is valid');
    } catch (error) {
      console.error('Token verification error:', error);
      errorResponse(res, error.message);
    }
  }
}

module.exports = new AuthController();
