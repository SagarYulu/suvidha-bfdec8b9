
const db = require('../config/database');

class RBACService {
  async getUserPermissions(userId) {
    const [permissions] = await db.execute(`
      SELECT DISTINCT p.name as permission
      FROM rbac_permissions p
      JOIN rbac_role_permissions rp ON p.id = rp.permission_id
      JOIN rbac_user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = ?
    `, [userId]);

    return permissions.map(p => p.permission);
  }

  async hasPermission(userId, permission) {
    const [result] = await db.execute(`
      SELECT COUNT(*) as count
      FROM rbac_permissions p
      JOIN rbac_role_permissions rp ON p.id = rp.permission_id
      JOIN rbac_user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = ? AND p.name = ?
    `, [userId, permission]);

    return result[0].count > 0;
  }

  async getUserRoles(userId) {
    const [roles] = await db.execute(`
      SELECT r.id, r.name, r.description
      FROM rbac_roles r
      JOIN rbac_user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ?
    `, [userId]);

    return roles;
  }

  async assignRoleToUser(userId, roleId) {
    await db.execute(`
      INSERT INTO rbac_user_roles (user_id, role_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE role_id = role_id
    `, [userId, roleId]);
  }

  async removeRoleFromUser(userId, roleId) {
    await db.execute(`
      DELETE FROM rbac_user_roles
      WHERE user_id = ? AND role_id = ?
    `, [userId, roleId]);
  }

  async getAllRoles() {
    const [roles] = await db.execute(`
      SELECT id, name, description, created_at, updated_at
      FROM rbac_roles
      ORDER BY name
    `);

    return roles;
  }

  async getAllPermissions() {
    const [permissions] = await db.execute(`
      SELECT id, name, description, created_at, updated_at
      FROM rbac_permissions
      ORDER BY name
    `);

    return permissions;
  }
}

module.exports = new RBACService();
