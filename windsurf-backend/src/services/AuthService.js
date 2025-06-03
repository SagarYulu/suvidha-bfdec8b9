
const jwt = require('jsonwebtoken');
const UserService = require('./UserService');

class AuthService {
  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async login(email, password) {
    const user = await UserService.validateCredentials(email, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    return {
      success: true,
      token,
      user
    };
  }

  async register(userData) {
    // Check if user already exists
    const existingUser = await UserService.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = await UserService.createUser(userData);
    const token = this.generateToken(user);

    return {
      success: true,
      token,
      user
    };
  }

  async verifyUser(userId) {
    const user = await UserService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return { success: true, user };
  }
}

module.exports = new AuthService();
