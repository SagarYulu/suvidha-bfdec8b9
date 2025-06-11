
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { JWT } = require('../config/constants');

class AuthService {
  static async login(email, password) {
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }

    // Generate tokens
    const token = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Remove password from user object
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      refreshToken
    };
  }

  static async createUser(userData) {
    // Check if user already exists
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user
    const user = await User.create(userData);
    
    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }

  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, JWT.REFRESH_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user || !user.is_active) {
        throw new Error('Invalid refresh token');
      }

      const newToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await User.verifyPassword(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    await User.updatePassword(userId, newPassword);
  }

  static generateAccessToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT.SECRET,
      { expiresIn: JWT.EXPIRES_IN }
    );
  }

  static generateRefreshToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email 
      },
      JWT.REFRESH_SECRET,
      { expiresIn: JWT.REFRESH_EXPIRES_IN }
    );
  }

  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT.SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user || !user.is_active) {
        throw new Error('Invalid token');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = AuthService;
