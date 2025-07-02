
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class AuthService {
  // Special admin accounts that have elevated privileges
  static SPECIAL_ADMIN_ACCOUNTS = [
    'admin@yulu.com',
    'sagar.km@yulu.bike',
    'superadmin@company.com'
  ];

  static async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Check if user is a special admin
    const isSpecialAdmin = this.SPECIAL_ADMIN_ACCOUNTS.includes(email.toLowerCase());
    
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      isSpecialAdmin,
      permissions: await User.getUserPermissions(user.id)
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    return {
      user: {
        ...user,
        isSpecialAdmin,
        permissions: tokenPayload.permissions
      },
      token,
      refreshToken
    };
  }

  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        throw new Error('User not found');
      }

      const isSpecialAdmin = this.SPECIAL_ADMIN_ACCOUNTS.includes(user.email.toLowerCase());
      
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        isSpecialAdmin,
        permissions: await User.getUserPermissions(user.id)
      };

      const newToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
      
      return { token: newToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async createUser(userData) {
    const { email, password, ...otherData } = userData;
    
    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await User.create({
      ...otherData,
      email,
      password: hashedPassword
    });

    return user;
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await User.verifyPassword(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    await User.updatePassword(userId, newPassword);
    return true;
  }
}

module.exports = AuthService;
