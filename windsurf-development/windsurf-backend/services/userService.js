
const UserModel = require('../models/User');

class UserService {
  async getUsers(filters = {}) {
    return await UserModel.getAll(filters);
  }

  async getUserById(id) {
    return await UserModel.findById(id);
  }

  async createUser(userData) {
    // Validate required fields
    if (!userData.name || !userData.email || !userData.password) {
      throw new Error('Name, email, and password are required');
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    return await UserModel.create(userData);
  }

  async updateUser(id, updateData) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // If email is being updated, check for duplicates
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await UserModel.findByEmail(updateData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
    }

    return await UserModel.update(id, updateData);
  }

  async deleteUser(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return await UserModel.delete(id);
  }

  async changePassword(id, oldPassword, newPassword) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isValidOldPassword = await UserModel.verifyPassword(oldPassword, user.password);
    if (!isValidOldPassword) {
      throw new Error('Invalid old password');
    }

    return await UserModel.updatePassword(id, newPassword);
  }
}

module.exports = new UserService();
