
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const queries = require('../queries/userQueries');
const { v4: uuidv4 } = require('uuid');

const getUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(queries.getAllUsers);

    res.json({
      success: true,
      users: users.map(user => ({
        ...user,
        password: undefined // Don't send password in response
      }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, city, cluster, manager } = req.body;
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 12);

    await pool.execute(queries.createUser, [
      userId,
      name,
      email,
      hashedPassword,
      role,
      city,
      cluster,
      manager,
      req.user.id // created_by
    ]);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.execute(queries.getUserById, [id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];
    delete user.password; // Don't send password

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, city, cluster, manager } = req.body;

    // Check if user exists
    const [users] = await pool.execute(queries.getUserById, [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await pool.execute(queries.updateUser, [
      name,
      email,
      role,
      city,
      cluster,
      manager,
      req.user.id, // last_updated_by
      id
    ]);

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [users] = await pool.execute(queries.getUserById, [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Soft delete
    await pool.execute(queries.deleteUser, [req.user.id, id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser
};
