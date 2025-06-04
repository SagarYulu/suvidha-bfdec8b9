
const userService = require('../services/userService');
const { validationResult } = require('express-validator');

class UserController {
  async getUsers(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { page = 1, limit = 10, role, status, search } = req.query;
      const filters = { role, status, search };
      
      const result = await userService.getUsers(filters, page, limit);
      
      res.json({
        success: true,
        data: result.users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch users',
        message: error.message 
      });
    }
  }

  async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ success: true, data: user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user',
        message: error.message 
      });
    }
  }

  async createUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const userData = {
        ...req.body,
        createdBy: req.user.id
      };
      
      const userId = await userService.createUser(userData);
      
      res.status(201).json({
        success: true,
        data: { id: userId },
        message: 'User created successfully'
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ 
        error: 'Failed to create user',
        message: error.message 
      });
    }
  }

  async updateUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { id } = req.params;
      const updateData = {
        ...req.body,
        updatedBy: req.user.id
      };
      
      const success = await userService.updateUser(id, updateData);
      
      if (!success) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        success: true,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ 
        error: 'Failed to update user',
        message: error.message 
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const success = await userService.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ 
        error: 'Failed to delete user',
        message: error.message 
      });
    }
  }
}

module.exports = new UserController();
