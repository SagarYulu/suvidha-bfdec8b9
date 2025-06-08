
const db = require('../config/database');

class RBACService {
  async getUserPermissions(userId) {
    const [permissions] = await db.execute(
      `SELECT DISTINCT p.* 
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = ?`,
      [userId]
    );
    return permissions;
  }

  async getUserRoles(userId) {
    const [roles] = await db.execute(
      `SELECT r.* 
       FROM roles r
       JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = ?`,
      [userId]
    );
    return roles;
  }

  async assignRoleToUser(userId, roleId) {
    await db.execute(
      'INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)',
      [userId, roleId]
    );
  }

  async removeRoleFromUser(userId, roleId) {
    await db.execute(
      'DELETE FROM user_roles WHERE user_id = ? AND role_id = ?',
      [userId, roleId]
    );
  }

  async getAllRoles() {
    const [roles] = await db.execute('SELECT * FROM roles ORDER BY name');
    return roles;
  }

  async getAllPermissions() {
    const [permissions] = await db.execute('SELECT * FROM permissions ORDER BY resource, action');
    return permissions;
  }

  async hasPermission(userId, permission) {
    const [result] = await db.execute(
      `SELECT COUNT(*) as count
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = ? AND p.name = ?`,
      [userId, permission]
    );
    return result[0].count > 0;
  }

  async hasRole(userId, roleName) {
    const [result] = await db.execute(
      `SELECT COUNT(*) as count
       FROM roles r
       JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = ? AND r.name = ?`,
      [userId, roleName]
    );
    return result[0].count > 0;
  }
}

module.exports = new RBACService();
