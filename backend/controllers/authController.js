
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { HTTP_STATUS, JWT } = require('../config/constants');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }
      
      // Check if user is active
      if (!user.is_active) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: 'Account deactivated',
          message: 'Your account has been deactivated. Please contact support.'
        });
      }
      
      // Verify password
      const isValidPassword = await User.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: JWT.EXPIRES_IN }
      );
      
      // Remove sensitive data from response
      const { password_hash, ...userResponse } = user;
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Login successful',
        data: {
          user: userResponse,
          token,
          expiresIn: JWT.EXPIRES_IN
        }
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Login failed',
        message: 'An error occurred during login'
      });
    }
  }

  async register(req, res) {
    try {
      const { email, password, full_name, role, cluster_id } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          error: 'User already exists',
          message: 'A user with this email already exists'
        });
      }
      
      // Create new user
      const newUser = await User.create({
        email,
        password,
        full_name,
        role,
        cluster_id
      });
      
      // Remove sensitive data from response
      const { password_hash, ...userResponse } = newUser;
      
      res.status(HTTP_STATUS.CREATED).json({
        message: 'User registered successfully',
        data: {
          user: userResponse
        }
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Registration failed',
        message: 'An error occurred during registration'
      });
    }
  }

  async logout(req, res) {
    try {
      // In a production environment, you might want to blacklist the token
      // For now, we'll just return a success message
      res.status(HTTP_STATUS.OK).json({
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Logout failed',
        message: 'An error occurred during logout'
      });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'User not found',
          message: 'User account no longer exists'
        });
      }
      
      // Get user permissions and roles
      const permissions = await User.getUserPermissions(user.id);
      const roles = await User.getUserRoles(user.id);
      
      // Remove sensitive data from response
      const { password_hash, ...userResponse } = user;
      
      res.status(HTTP_STATUS.OK).json({
        message: 'User data retrieved successfully',
        data: {
          user: {
            ...userResponse,
            permissions,
            roles
          }
        }
      });
      
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to get user data',
        message: 'An error occurred while retrieving user data'
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      
      // Get current user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'User not found',
          message: 'User account no longer exists'
        });
      }
      
      // Verify current password
      const isValidPassword = await User.verifyPassword(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: 'Invalid password',
          message: 'Current password is incorrect'
        });
      }
      
      // Update password
      await User.updatePassword(userId, newPassword);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Password changed successfully'
      });
      
    } catch (error) {
      console.error('Change password error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Password change failed',
        message: 'An error occurred while changing password'
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const userId = req.user.id;
      
      // Get fresh user data
      const user = await User.findById(userId);
      if (!user || !user.is_active) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: 'Invalid user',
          message: 'User not found or account deactivated'
        });
      }
      
      // Generate new token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: JWT.EXPIRES_IN }
      );
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Token refreshed successfully',
        data: {
          token,
          expiresIn: JWT.EXPIRES_IN
        }
      });
      
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Token refresh failed',
        message: 'An error occurred while refreshing token'
      });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      // This is a placeholder implementation
      // In a real application, you would:
      // 1. Verify the email exists
      // 2. Generate a reset token
      // 3. Send reset email
      // 4. Store reset token with expiration
      
      res.status(HTTP_STATUS.OK).json({
        message: 'If an account with that email exists, a password reset link has been sent'
      });
      
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Forgot password failed',
        message: 'An error occurred while processing password reset request'
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      
      // This is a placeholder implementation
      // In a real application, you would:
      // 1. Verify the reset token
      // 2. Check if token is not expired
      // 3. Update the user's password
      // 4. Invalidate the reset token
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Password has been reset successfully'
      });
      
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Password reset failed',
        message: 'An error occurred while resetting password'
      });
    }
  }
}

module.exports = new AuthController();
