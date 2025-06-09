
const UserModel = require('../models/User');

class UserService {
  async getUsers(filters = {}) {
    return await UserModel.getAll(filters);
  }

  async getUserById(id) {
    return await UserModel.findById(id);
  }

  async createUser(userData) {
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    return await UserModel.create(userData);
  }

  async updateUser(id, updateData) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const success = await UserModel.update(id, updateData);
    if (!success) {
      throw new Error('Failed to update user');
    }

    return await UserModel.findById(id);
  }

  async deleteUser(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return await UserModel.delete(id);
  }
}

module.exports = new UserService();
