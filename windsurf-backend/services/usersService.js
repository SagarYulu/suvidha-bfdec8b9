const { pool } = require('../config/database');

const usersService = {
  async getUsers() {
    try {
      const [users] = await pool.execute(`
        SELECT id, email, name, role, is_active, created_at, updated_at
        FROM dashboard_users
        ORDER BY name ASC
      `);
      return users;
    } catch (error) {
      console.error('Get users error:', error);
      throw new Error('Failed to fetch users');
    }
  },

  async getUserById(id) {
    try {
      const [users] = await pool.execute(`
        SELECT id, email, name, role, is_active, created_at, updated_at
        FROM dashboard_users
        WHERE id = ?
      `, [id]);
      return users[0];
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw new Error('Failed to fetch user');
    }
  },

  async createUser(userData) {
    try {
      const { name, email, password, role } = userData;
      const [result] = await pool.execute(`
        INSERT INTO dashboard_users (name, email, password, role)
        VALUES (?, ?, ?, ?)
      `, [name, email, password, role]);
      return { id: result.insertId, ...userData };
    } catch (error) {
      console.error('Create user error:', error);
      throw new Error('Failed to create user');
    }
  },

  async updateUser(id, userData) {
    try {
      const { name, email, role } = userData;
      await pool.execute(`
        UPDATE dashboard_users
        SET name = ?, email = ?, role = ?
        WHERE id = ?
      `, [name, email, role, id]);
      return { id, ...userData };
    } catch (error) {
      console.error('Update user error:', error);
      throw new Error('Failed to update user');
    }
  },

  async deleteUser(id) {
    try {
      await pool.execute(`
        DELETE FROM dashboard_users
        WHERE id = ?
      `, [id]);
      return { id };
    } catch (error) {
      console.error('Delete user error:', error);
      throw new Error('Failed to delete user');
    }
  },

  async getEmployees() {
    try {
      const [employees] = await pool.execute(`
        SELECT employee_uuid, employee_name, employee_id, city, cluster, manager_name
        FROM employees
        ORDER BY employee_name ASC
      `);
      return employees;
    } catch (error) {
      console.error('Get employees error:', error);
      throw new Error('Failed to fetch employees');
    }
  }
};

module.exports = usersService;
