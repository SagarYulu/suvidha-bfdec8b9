
const rbacService = require('../services/rbacService');

class RBACController {
  async getUserPermissions(req, res) {
    try {
      const permissions = await rbacService.getUserPermissions(req.params.userId);
      res.json({ permissions });
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      res.status(500).json({ error: 'Failed to fetch user permissions' });
    }
  }

  async getUserRoles(req, res) {
    try {
      const roles = await rbacService.getUserRoles(req.params.userId);
      res.json({ roles });
    } catch (error) {
      console.error('Error fetching user roles:', error);
      res.status(500).json({ error: 'Failed to fetch user roles' });
    }
  }

  async assignRole(req, res) {
    try {
      const { userId, roleId } = req.body;
      await rbacService.assignRoleToUser(userId, roleId);
      res.json({ message: 'Role assigned successfully' });
    } catch (error) {
      console.error('Error assigning role:', error);
      res.status(500).json({ error: 'Failed to assign role' });
    }
  }

  async removeRole(req, res) {
    try {
      const { userId, roleId } = req.body;
      await rbacService.removeRoleFromUser(userId, roleId);
      res.json({ message: 'Role removed successfully' });
    } catch (error) {
      console.error('Error removing role:', error);
      res.status(500).json({ error: 'Failed to remove role' });
    }
  }

  async getAllRoles(req, res) {
    try {
      const roles = await rbacService.getAllRoles();
      res.json({ roles });
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  }

  async getAllPermissions(req, res) {
    try {
      const permissions = await rbacService.getAllPermissions();
      res.json({ permissions });
    } catch (error) {
      console.error('Error fetching permissions:', error);
      res.status(500).json({ error: 'Failed to fetch permissions' });
    }
  }
}

module.exports = new RBACController();
