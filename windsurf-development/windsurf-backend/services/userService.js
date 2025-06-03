
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

class UserService {
  async getUsers(filters) {
    return await userModel.findAll(filters);
  }

  async getUser(id) {
    return await userModel.findById(id);
  }

  async createUser(userData) {
    const { name, email, password, role, phone, department } = userData;

    if (!name || !email || !password || !role) {
      throw new Error('Name, email, password, and role are required');
    }

    // Check if email already exists
    const existingUser = await userModel.findByEmail(email.toLowerCase());
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await userModel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      phone,
      department
    });

    return {
      userId,
      message: 'User created successfully',
      user: {
        id: userId,
        name,
        email: email.toLowerCase(),
        role,
        phone,
        department
      }
    };
  }

  async updateUser(id, updates) {
    await userModel.update(id, updates);
  }

  async deleteUser(id) {
    return await userModel.delete(id);
  }
}

module.exports = new UserService();
