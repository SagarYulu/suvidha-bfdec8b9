
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
    successResponse(res, null, 'Logged out successfully');
  }

  async refreshToken(req, res) {
    try {
      const token = AuthService.generateToken(req.user);
      successResponse(res, { token }, 'Token refreshed successfully');
    } catch (error) {
      console.error('Token refresh error:', error);
      errorResponse(res, 'Token refresh failed', 500);
    }
  }

  async getProfile(req, res) {
    try {
      successResponse(res, { user: req.user }, 'Profile fetched successfully');
    } catch (error) {
      console.error('Get profile error:', error);
      errorResponse(res, 'Failed to fetch profile', 500);
    }
  }

  async verifyToken(req, res) {
    successResponse(res, { user: req.user }, 'Token is valid');
  }
}

module.exports = new AuthController();
