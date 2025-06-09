
const UserModel = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class UserController {
  async getUsers(req, res) {
    try {
      const filters = req.query;
      const users = await UserModel.getAll(filters);
      successResponse(res, users, 'Users fetched successfully');
    } catch (error) {
      console.error('Get users error:', error);
      errorResponse(res, 'Failed to fetch users', 500);
    }
  }

  async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }
      successResponse(res, user, 'User fetched successfully');
    } catch (error) {
      console.error('Get user error:', error);
      errorResponse(res, 'Failed to fetch user', 500);
    }
  }

  async createUser(req, res) {
    try {
      const userData = req.body;
      const user = await UserModel.create(userData);
      successResponse(res, user, 'User created successfully', 201);
    } catch (error) {
      console.error('Create user error:', error);
      errorResponse(res, 'Failed to create user', 500);
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updated = await UserModel.update(id, updateData);
      if (!updated) {
        return errorResponse(res, 'User not found', 404);
      }
      const user = await UserModel.findById(id);
      successResponse(res, user, 'User updated successfully');
    } catch (error) {
      console.error('Update user error:', error);
      errorResponse(res, 'Failed to update user', 500);
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await UserModel.delete(id);
      successResponse(res, null, 'User deleted successfully');
    } catch (error) {
      console.error('Delete user error:', error);
      errorResponse(res, 'Failed to delete user', 500);
    }
  }
}

module.exports = new UserController();
