
const AuthService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { validationResult } = require('express-validator');

class AuthController {
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

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
      // In a stateless JWT system, logout is mainly client-side
      // But we can implement token blacklisting if needed
      successResponse(res, null, 'Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      errorResponse(res, error.message);
    }
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const profile = await AuthService.getProfile(userId);
      
      successResponse(res, { user: profile }, 'Profile retrieved successfully');
    } catch (error) {
      console.error('Get profile error:', error);
      errorResponse(res, error.message);
    }
  }

  async verifyToken(req, res) {
    try {
      // If we reach here, the token is valid (middleware passed)
      successResponse(res, { valid: true, user: req.user }, 'Token is valid');
    } catch (error) {
      console.error('Token verification error:', error);
      errorResponse(res, error.message, 401);
    }
  }
}

module.exports = new AuthController();
