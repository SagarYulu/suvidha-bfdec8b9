
const UserService = require('../services/userService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class UserController {
  async getUsers(req, res) {
    try {
      const filters = req.query;
      const users = await UserService.getUsers(filters);
      
      successResponse(res, users, 'Users retrieved successfully');
    } catch (error) {
      console.error('Get users error:', error);
      errorResponse(res, error.message);
    }
  }

  async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }
      
      successResponse(res, user, 'User retrieved successfully');
    } catch (error) {
      console.error('Get user error:', error);
      errorResponse(res, error.message);
    }
  }

  async createUser(req, res) {
    try {
      const userData = {
        ...req.body,
        created_by: req.user.id
      };
      
      const user = await UserService.createUser(userData);
      successResponse(res, user, 'User created successfully', 201);
    } catch (error) {
      console.error('Create user error:', error);
      errorResponse(res, error.message);
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        last_updated_by: req.user.id
      };
      
      const user = await UserService.updateUser(id, updateData);
      successResponse(res, user, 'User updated successfully');
    } catch (error) {
      console.error('Update user error:', error);
      errorResponse(res, error.message);
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      if (id === req.user.id) {
        return errorResponse(res, 'Cannot delete your own account', 400);
      }
      
      await UserService.deleteUser(id);
      successResponse(res, null, 'User deleted successfully');
    } catch (error) {
      console.error('Delete user error:', error);
      errorResponse(res, error.message);
    }
  }
}

module.exports = new UserController();
