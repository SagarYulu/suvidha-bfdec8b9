
const usersService = require('../services/usersService');
const { validationResult } = require('express-validator');

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
      res.status(500).json({ error: error.message });
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
      res.status(500).json({ error: error.message });
    }
  },

  async getUserById(req, res) {
    try {
      const user = await usersService.getUserById(req.params.id, req.user);
      res.json({
        success: true,
        user
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Access denied') {
        return res.status(403).json({ error: error.message });
      }
      console.error('Get user error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await usersService.createUser(req.body, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      if (error.message === 'User already exists') {
        return res.status(400).json({ error: error.message });
      }
      console.error('Create user error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      await usersService.updateUser(req.params.id, req.body, req.user);
      res.json({
        success: true,
        message: 'User updated successfully'
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Access denied' || error.message === 'Only admins can change user roles') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'No fields to update') {
        return res.status(400).json({ error: error.message });
      }
      console.error('Update user error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteUser(req, res) {
    try {
      await usersService.deleteUser(req.params.id, req.user.id);
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Cannot delete your own account') {
        return res.status(400).json({ error: error.message });
      }
      console.error('Delete user error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = usersController;
