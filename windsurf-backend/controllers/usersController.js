
const { validationResult } = require('express-validator');
const usersService = require('../services/usersService');

const usersController = {
  async getUsers(req, res) {
    try {
      const users = await usersService.getUsers();
      res.json({
        success: true,
        users
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  },

  async getEmployees(req, res) {
    try {
      const employees = await usersService.getEmployees();
      res.json({
        success: true,
        employees
      });
    } catch (error) {
      console.error('Get employees error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employees'
      });
    }
  },

  async getUserById(req, res) {
    try {
      const userId = req.params.id;
      const user = await usersService.getUserById(userId, req.user);
      
      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(error.message === 'User not found' ? 404 : 403).json({
        success: false,
        message: error.message || 'Failed to fetch user'
      });
    }
  },

  async createUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const result = await usersService.createUser(req.body, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      console.error('Create user error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create user'
      });
    }
  },

  async updateUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const userId = req.params.id;
      const result = await usersService.updateUser(userId, req.body, req.user);
      res.json(result);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update user'
      });
    }
  },

  async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      await usersService.deleteUser(userId);
      
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete user'
      });
    }
  }
};

module.exports = usersController;
