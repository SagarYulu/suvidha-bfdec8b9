const usersService = require('../services/usersService');

const usersController = {
  async getUsers(req, res) {
    try {
      const users = await usersService.getAllUsers();
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
      const employees = await usersService.getAllEmployees();
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
      const user = await usersService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createUser(req, res) {
    try {
      const newUser = await usersService.createUser(req.body);
      res.status(201).json({
        success: true,
        user: newUser,
        message: 'User created successfully'
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateUser(req, res) {
    try {
      const updatedUser = await usersService.updateUser(req.params.id, req.body);
      res.json({
        success: true,
        user: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteUser(req, res) {
    try {
      await usersService.deleteUser(req.params.id);
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = usersController;
