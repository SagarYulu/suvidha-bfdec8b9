
const userService = require('./userService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  async login(email, password) {
    try {
      const user = await userService.getUserByEmail(email);
      
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      if (user.status !== 'active') {
        return {
          success: false,
          message: 'Account is not active'
        };
      }

      // Update last login
      await userService.updateLastLogin(user.id);

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'windsurf-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return {
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      return await userService.getUserById(id);
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  }

  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'windsurf-secret-key');
      
      // Generate new token
      const newToken = jwt.sign(
        { 
          id: decoded.id, 
          email: decoded.email, 
          role: decoded.role 
        },
        process.env.JWT_SECRET || 'windsurf-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return {
        success: true,
        token: newToken
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid token'
      };
    }
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'windsurf-secret-key');
    } catch (error) {
      return null;
    }
  }
}

module.exports = new AuthService();
