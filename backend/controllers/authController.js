
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { HTTP_STATUS, JWT } = require('../config/constants');
const AuthService = require('../services/authService');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      const result = await AuthService.login(email, password);
      
      // Add role validation to prevent cross-platform access
      const user = result.user;
      const adminRoles = ['City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'];
      const adminEmails = ['sagar.km@yulu.bike', 'admin@yulu.com'];
      
      // Check if this is an admin login request (from admin dashboard)
      const isAdminRequest = req.headers['x-admin-login'] === 'true' || req.path.includes('admin');
      
      if (isAdminRequest) {
        // Admin dashboard login - only allow admin roles/emails
        const isAdminRole = adminRoles.includes(user.role);
        const isAdminEmail = adminEmails.includes(user.email);
        
        if (!isAdminRole && !isAdminEmail) {
          return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            error: 'Access denied',
            message: 'Admin dashboard access restricted to authorized personnel only. Please use the employee mobile app.'
          });
        }
      } else {
        // Mobile app login - prevent admin users from accessing
        const isAdminRole = adminRoles.includes(user.role);
        const isAdminEmail = adminEmails.includes(user.email);
        
        if (isAdminRole || isAdminEmail) {
          return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            error: 'Access denied',
            message: 'Admin users cannot access the mobile app. Please use the admin dashboard.'
          });
        }
      }
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Login failed',
        message: error.message
      });
    }
  }

  async register(req, res) {
    try {
      const userData = req.body;
      
      const user = await AuthService.createUser(userData);
      
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Registration failed',
        message: error.message
      });
    }
  }

  async getCurrentUser(req, res) {
    try {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'User retrieved successfully',
        data: req.user
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to get user',
        message: error.message
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      const result = await AuthService.refreshToken(refreshToken);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Token refresh failed',
        message: error.message
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      
      await AuthService.changePassword(userId, currentPassword, newPassword);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Password change failed',
        message: error.message
      });
    }
  }

  async logout(req, res) {
    try {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Logout failed',
        message: error.message
      });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      // Implement forgot password logic here
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to send reset email',
        message: error.message
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      
      // Implement reset password logic here
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Password reset failed',
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();
