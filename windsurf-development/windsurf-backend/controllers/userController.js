
const userService = require('../services/userService');
const { validationResult } = require('express-validator');

class UserController {
  async getUsers(req, res) {
    try {
      const result = await userService.getUsers(req.query);
      res.json(result);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  async getUser(req, res) {
    try {
      const user = await userService.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  async createUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const result = await userService.createUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.message === 'Email already exists') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  async updateUser(req, res) {
    try {
      await userService.updateUser(req.params.id, req.body);
      res.json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  async deleteUser(req, res) {
    try {
      const deleted = await userService.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
}

module.exports = new UserController();
