
const { pool } = require('../config/database');

class DashboardUserModel {
  // Get all dashboard users
  async getAllUsers(filters = {}) {
    const { role, city, cluster, search } = filters;
    
    let query = 'SELECT * FROM dashboard_users WHERE 1=1';
    const params = [];
    
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    
    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }
    
    if (cluster) {
      query += ' AND cluster = ?';
      params.push(cluster);
    }
    
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR employee_id LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [users] = await pool.execute(query, params);
    return users;
  }

  // Get user by ID
  async getUserById(id) {
    const query = 'SELECT * FROM dashboard_users WHERE id = ?';
    const [users] = await pool.execute(query, [id]);
    return users[0] || null;
  }

  // Get user by email
  async getUserByEmail(email) {
    const query = 'SELECT * FROM dashboard_users WHERE email = ?';
    const [users] = await pool.execute(query, [email]);
    return users[0] || null;
  }

  // Create new dashboard user
  async createUser(userData) {
    const {
      name,
      email,
      employeeId,
      password,
      role,
      manager,
      cluster,
      city,
      phone,
      createdBy
    } = userData;

    const query = `
      INSERT INTO dashboard_users (
        name, email, employee_id, password, role, manager, cluster, city, phone,
        created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await pool.execute(query, [
      name, email, employeeId, password, role, manager, cluster, city, phone, createdBy
    ]);

    return this.getUserById(result.insertId);
  }

  // Update dashboard user
  async updateUser(id, updateData, updatedBy) {
    const allowedFields = [
      'name', 'email', 'employee_id', 'role', 'manager', 'cluster', 'city', 'phone'
    ];
    
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    fields.push('last_updated_by = ?', 'updated_at = NOW()');
    values.push(updatedBy, id);

    const query = `UPDATE dashboard_users SET ${fields.join(', ')} WHERE id = ?`;
    await pool.execute(query, values);

    return this.getUserById(id);
  }

  // Update password
  async updatePassword(id, hashedPassword) {
    const query = 'UPDATE dashboard_users SET password = ?, updated_at = NOW() WHERE id = ?';
    await pool.execute(query, [hashedPassword, id]);
    return true;
  }

  // Delete dashboard user
  async deleteUser(id) {
    const query = 'DELETE FROM dashboard_users WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Get user statistics
  async getUserStats() {
    const query = `
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
        SUM(CASE WHEN role = 'manager' THEN 1 ELSE 0 END) as manager_count,
        SUM(CASE WHEN role = 'agent' THEN 1 ELSE 0 END) as agent_count,
        COUNT(DISTINCT city) as cities_count,
        COUNT(DISTINCT cluster) as clusters_count
      FROM dashboard_users
    `;

    const [stats] = await pool.execute(query);
    return stats[0];
  }

  // Get users by role
  async getUsersByRole(role) {
    const query = 'SELECT * FROM dashboard_users WHERE role = ? ORDER BY name ASC';
    const [users] = await pool.execute(query, [role]);
    return users;
  }
}

module.exports = new DashboardUserModel();
