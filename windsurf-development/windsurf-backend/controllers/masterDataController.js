
const masterDataService = require('../services/masterDataService');
const auditService = require('../services/auditService');

class MasterDataController {
  // ROLES CONTROLLERS
  async getRoles(req, res) {
    try {
      const roles = await masterDataService.getAllRoles();
      res.json(roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  }

  async createRole(req, res) {
    try {
      const { name, createdBy } = req.body;
      
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Role name is required' });
      }
      
      const role = await masterDataService.createRole(name.trim(), createdBy);
      
      // Log audit trail
      await auditService.logAction('role', role.id, 'create', { name: name.trim() }, createdBy);
      
      res.status(201).json(role);
    } catch (error) {
      console.error('Error creating role:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Role name already exists' });
      }
      res.status(500).json({ error: 'Failed to create role' });
    }
  }

  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { name, updatedBy } = req.body;
      
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Role name is required' });
      }
      
      const currentRole = await masterDataService.getRoleById(id);
      if (!currentRole) {
        return res.status(404).json({ error: 'Role not found' });
      }
      
      const role = await masterDataService.updateRole(id, name.trim());
      
      // Log audit trail
      await auditService.logAction('role', id, 'update', {
        previous: { name: currentRole.name },
        current: { name: name.trim() }
      }, updatedBy);
      
      res.json(role);
    } catch (error) {
      console.error('Error updating role:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Role name already exists' });
      }
      res.status(500).json({ error: 'Failed to update role' });
    }
  }

  async deleteRole(req, res) {
    try {
      const { id } = req.params;
      const { deletedBy } = req.body;
      
      const currentRole = await masterDataService.getRoleById(id);
      if (!currentRole) {
        return res.status(404).json({ error: 'Role not found' });
      }
      
      await masterDataService.deleteRole(id);
      
      // Log audit trail
      await auditService.logAction('role', id, 'delete', { name: currentRole.name }, deletedBy);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting role:', error);
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ error: 'Cannot delete role as it is in use' });
      }
      res.status(500).json({ error: 'Failed to delete role' });
    }
  }

  // CITIES CONTROLLERS
  async getCities(req, res) {
    try {
      const cities = await masterDataService.getAllCities();
      res.json(cities);
    } catch (error) {
      console.error('Error fetching cities:', error);
      res.status(500).json({ error: 'Failed to fetch cities' });
    }
  }

  async createCity(req, res) {
    try {
      const { name, createdBy } = req.body;
      
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'City name is required' });
      }
      
      const city = await masterDataService.createCity(name.trim(), createdBy);
      
      // Log audit trail
      await auditService.logAction('city', city.id, 'create', { name: name.trim() }, createdBy);
      
      res.status(201).json(city);
    } catch (error) {
      console.error('Error creating city:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'City name already exists' });
      }
      res.status(500).json({ error: 'Failed to create city' });
    }
  }

  async updateCity(req, res) {
    try {
      const { id } = req.params;
      const { name, updatedBy } = req.body;
      
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'City name is required' });
      }
      
      const currentCity = await masterDataService.getCityById(id);
      if (!currentCity) {
        return res.status(404).json({ error: 'City not found' });
      }
      
      const city = await masterDataService.updateCity(id, name.trim());
      
      // Log audit trail
      await auditService.logAction('city', id, 'update', {
        previous: { name: currentCity.name },
        current: { name: name.trim() }
      }, updatedBy);
      
      res.json(city);
    } catch (error) {
      console.error('Error updating city:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'City name already exists' });
      }
      res.status(500).json({ error: 'Failed to update city' });
    }
  }

  async deleteCity(req, res) {
    try {
      const { id } = req.params;
      const { deletedBy } = req.body;
      
      const currentCity = await masterDataService.getCityById(id);
      if (!currentCity) {
        return res.status(404).json({ error: 'City not found' });
      }
      
      await masterDataService.deleteCity(id);
      
      // Log audit trail
      await auditService.logAction('city', id, 'delete', { name: currentCity.name }, deletedBy);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting city:', error);
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ error: 'Cannot delete city as it is in use' });
      }
      res.status(500).json({ error: 'Failed to delete city' });
    }
  }

  // CLUSTERS CONTROLLERS
  async getClusters(req, res) {
    try {
      const { cityId } = req.query;
      const clusters = await masterDataService.getAllClusters(cityId);
      res.json(clusters);
    } catch (error) {
      console.error('Error fetching clusters:', error);
      res.status(500).json({ error: 'Failed to fetch clusters' });
    }
  }

  async createCluster(req, res) {
    try {
      const { name, cityId, createdBy } = req.body;
      
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Cluster name is required' });
      }
      
      if (!cityId) {
        return res.status(400).json({ error: 'City is required' });
      }
      
      const cluster = await masterDataService.createCluster(name.trim(), cityId, createdBy);
      
      // Log audit trail
      await auditService.logAction('cluster', cluster.id, 'create', { 
        name: name.trim(), 
        cityId 
      }, createdBy);
      
      res.status(201).json(cluster);
    } catch (error) {
      console.error('Error creating cluster:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Cluster name already exists in this city' });
      }
      res.status(500).json({ error: 'Failed to create cluster' });
    }
  }

  async updateCluster(req, res) {
    try {
      const { id } = req.params;
      const { name, cityId, updatedBy } = req.body;
      
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Cluster name is required' });
      }
      
      if (!cityId) {
        return res.status(400).json({ error: 'City is required' });
      }
      
      const currentCluster = await masterDataService.getClusterById(id);
      if (!currentCluster) {
        return res.status(404).json({ error: 'Cluster not found' });
      }
      
      const cluster = await masterDataService.updateCluster(id, name.trim(), cityId);
      
      // Log audit trail
      await auditService.logAction('cluster', id, 'update', {
        previous: { 
          name: currentCluster.name, 
          cityId: currentCluster.cityId 
        },
        current: { 
          name: name.trim(), 
          cityId 
        }
      }, updatedBy);
      
      res.json(cluster);
    } catch (error) {
      console.error('Error updating cluster:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Cluster name already exists in this city' });
      }
      res.status(500).json({ error: 'Failed to update cluster' });
    }
  }

  async deleteCluster(req, res) {
    try {
      const { id } = req.params;
      const { deletedBy } = req.body;
      
      const currentCluster = await masterDataService.getClusterById(id);
      if (!currentCluster) {
        return res.status(404).json({ error: 'Cluster not found' });
      }
      
      await masterDataService.deleteCluster(id);
      
      // Log audit trail
      await auditService.logAction('cluster', id, 'delete', {
        name: currentCluster.name,
        cityId: currentCluster.cityId,
        cityName: currentCluster.cityName
      }, deletedBy);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting cluster:', error);
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ error: 'Cannot delete cluster as it is in use' });
      }
      res.status(500).json({ error: 'Failed to delete cluster' });
    }
  }

  // AUDIT LOGS CONTROLLER
  async getAuditLogs(req, res) {
    try {
      const { entityType } = req.query;
      const auditLogs = await auditService.getAuditLogs(entityType);
      res.json(auditLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  }
}

module.exports = new MasterDataController();
