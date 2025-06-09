
const UserService = require('../services/userService');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { validationResult } = require('express-validator');

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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const userData = req.body;
      const user = await UserService.createUser(userData);
      
      successResponse(res, user, 'User created successfully', 201);
    } catch (error) {
      console.error('Create user error:', error);
      errorResponse(res, error.message);
    }
  }

  async updateUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const updateData = req.body;
      
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
      
      await UserService.deleteUser(id);
      successResponse(res, null, 'User deleted successfully');
    } catch (error) {
      console.error('Delete user error:', error);
      errorResponse(res, error.message);
    }
  }
}

module.exports = new UserController();
