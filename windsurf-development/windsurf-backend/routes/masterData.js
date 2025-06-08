
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Helper function to log audit trail
const logAuditTrail = async (entityType, entityId, action, changes, createdBy) => {
  try {
    await db.execute(
      `INSERT INTO master_audit_logs (id, entity_type, entity_id, action, changes, created_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), entityType, entityId, action, JSON.stringify(changes), createdBy]
    );
  } catch (error) {
    console.error('Error logging audit trail:', error);
  }
};

// ROLES ROUTES

// Get all roles
router.get('/roles', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM master_roles ORDER BY name ASC'
    );
    
    const roles = rows.map(row => ({
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Create a new role
router.post('/roles', auth, async (req, res) => {
  try {
    const { name, createdBy } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Role name is required' });
    }
    
    const roleId = uuidv4();
    
    await db.execute(
      `INSERT INTO master_roles (id, name) VALUES (?, ?)`,
      [roleId, name.trim()]
    );
    
    // Log audit trail
    await logAuditTrail('role', roleId, 'create', { name: name.trim() }, createdBy);
    
    const [rows] = await db.execute(
      'SELECT * FROM master_roles WHERE id = ?',
      [roleId]
    );
    
    const role = {
      id: rows[0].id,
      name: rows[0].name,
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at
    };
    
    res.status(201).json(role);
  } catch (error) {
    console.error('Error creating role:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Role name already exists' });
    }
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// Update a role
router.put('/roles/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, updatedBy } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Role name is required' });
    }
    
    // Get current role for audit
    const [currentRole] = await db.execute(
      'SELECT * FROM master_roles WHERE id = ?',
      [id]
    );
    
    if (currentRole.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    await db.execute(
      'UPDATE master_roles SET name = ? WHERE id = ?',
      [name.trim(), id]
    );
    
    // Log audit trail
    await logAuditTrail('role', id, 'update', {
      previous: { name: currentRole[0].name },
      current: { name: name.trim() }
    }, updatedBy);
    
    const [rows] = await db.execute(
      'SELECT * FROM master_roles WHERE id = ?',
      [id]
    );
    
    const role = {
      id: rows[0].id,
      name: rows[0].name,
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at
    };
    
    res.json(role);
  } catch (error) {
    console.error('Error updating role:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Role name already exists' });
    }
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Delete a role
router.delete('/roles/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { deletedBy } = req.body;
    
    // Get current role for audit
    const [currentRole] = await db.execute(
      'SELECT * FROM master_roles WHERE id = ?',
      [id]
    );
    
    if (currentRole.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    await db.execute('DELETE FROM master_roles WHERE id = ?', [id]);
    
    // Log audit trail
    await logAuditTrail('role', id, 'delete', {
      name: currentRole[0].name
    }, deletedBy);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting role:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: 'Cannot delete role as it is in use' });
    }
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

// CITIES ROUTES

// Get all cities
router.get('/cities', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM master_cities ORDER BY name ASC'
    );
    
    const cities = rows.map(row => ({
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

// Create a new city
router.post('/cities', auth, async (req, res) => {
  try {
    const { name, createdBy } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'City name is required' });
    }
    
    const cityId = uuidv4();
    
    await db.execute(
      `INSERT INTO master_cities (id, name) VALUES (?, ?)`,
      [cityId, name.trim()]
    );
    
    // Log audit trail
    await logAuditTrail('city', cityId, 'create', { name: name.trim() }, createdBy);
    
    const [rows] = await db.execute(
      'SELECT * FROM master_cities WHERE id = ?',
      [cityId]
    );
    
    const city = {
      id: rows[0].id,
      name: rows[0].name,
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at
    };
    
    res.status(201).json(city);
  } catch (error) {
    console.error('Error creating city:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'City name already exists' });
    }
    res.status(500).json({ error: 'Failed to create city' });
  }
});

// Update a city
router.put('/cities/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, updatedBy } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'City name is required' });
    }
    
    // Get current city for audit
    const [currentCity] = await db.execute(
      'SELECT * FROM master_cities WHERE id = ?',
      [id]
    );
    
    if (currentCity.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    await db.execute(
      'UPDATE master_cities SET name = ? WHERE id = ?',
      [name.trim(), id]
    );
    
    // Log audit trail
    await logAuditTrail('city', id, 'update', {
      previous: { name: currentCity[0].name },
      current: { name: name.trim() }
    }, updatedBy);
    
    const [rows] = await db.execute(
      'SELECT * FROM master_cities WHERE id = ?',
      [id]
    );
    
    const city = {
      id: rows[0].id,
      name: rows[0].name,
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at
    };
    
    res.json(city);
  } catch (error) {
    console.error('Error updating city:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'City name already exists' });
    }
    res.status(500).json({ error: 'Failed to update city' });
  }
});

// Delete a city
router.delete('/cities/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { deletedBy } = req.body;
    
    // Get current city for audit
    const [currentCity] = await db.execute(
      'SELECT * FROM master_cities WHERE id = ?',
      [id]
    );
    
    if (currentCity.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    await db.execute('DELETE FROM master_cities WHERE id = ?', [id]);
    
    // Log audit trail
    await logAuditTrail('city', id, 'delete', {
      name: currentCity[0].name
    }, deletedBy);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting city:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: 'Cannot delete city as it is in use' });
    }
    res.status(500).json({ error: 'Failed to delete city' });
  }
});

// CLUSTERS ROUTES

// Get all clusters or clusters by city
router.get('/clusters', auth, async (req, res) => {
  try {
    const { cityId } = req.query;
    
    let query = `
      SELECT c.*, ct.name as city_name 
      FROM master_clusters c 
      JOIN master_cities ct ON c.city_id = ct.id
    `;
    const params = [];
    
    if (cityId) {
      query += ' WHERE c.city_id = ?';
      params.push(cityId);
    }
    
    query += ' ORDER BY c.name ASC';
    
    const [rows] = await db.execute(query, params);
    
    const clusters = rows.map(row => ({
      id: row.id,
      name: row.name,
      cityId: row.city_id,
      cityName: row.city_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    res.json(clusters);
  } catch (error) {
    console.error('Error fetching clusters:', error);
    res.status(500).json({ error: 'Failed to fetch clusters' });
  }
});

// Create a new cluster
router.post('/clusters', auth, async (req, res) => {
  try {
    const { name, cityId, createdBy } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Cluster name is required' });
    }
    
    if (!cityId) {
      return res.status(400).json({ error: 'City is required' });
    }
    
    const clusterId = uuidv4();
    
    await db.execute(
      `INSERT INTO master_clusters (id, name, city_id) VALUES (?, ?, ?)`,
      [clusterId, name.trim(), cityId]
    );
    
    // Log audit trail
    await logAuditTrail('cluster', clusterId, 'create', { 
      name: name.trim(), 
      cityId 
    }, createdBy);
    
    const [rows] = await db.execute(
      `SELECT c.*, ct.name as city_name 
       FROM master_clusters c 
       JOIN master_cities ct ON c.city_id = ct.id 
       WHERE c.id = ?`,
      [clusterId]
    );
    
    const cluster = {
      id: rows[0].id,
      name: rows[0].name,
      cityId: rows[0].city_id,
      cityName: rows[0].city_name,
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at
    };
    
    res.status(201).json(cluster);
  } catch (error) {
    console.error('Error creating cluster:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Cluster name already exists in this city' });
    }
    res.status(500).json({ error: 'Failed to create cluster' });
  }
});

// Update a cluster
router.put('/clusters/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cityId, updatedBy } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Cluster name is required' });
    }
    
    if (!cityId) {
      return res.status(400).json({ error: 'City is required' });
    }
    
    // Get current cluster for audit
    const [currentCluster] = await db.execute(
      `SELECT c.*, ct.name as city_name 
       FROM master_clusters c 
       JOIN master_cities ct ON c.city_id = ct.id 
       WHERE c.id = ?`,
      [id]
    );
    
    if (currentCluster.length === 0) {
      return res.status(404).json({ error: 'Cluster not found' });
    }
    
    await db.execute(
      'UPDATE master_clusters SET name = ?, city_id = ? WHERE id = ?',
      [name.trim(), cityId, id]
    );
    
    // Log audit trail
    await logAuditTrail('cluster', id, 'update', {
      previous: { 
        name: currentCluster[0].name, 
        cityId: currentCluster[0].city_id 
      },
      current: { 
        name: name.trim(), 
        cityId 
      }
    }, updatedBy);
    
    const [rows] = await db.execute(
      `SELECT c.*, ct.name as city_name 
       FROM master_clusters c 
       JOIN master_cities ct ON c.city_id = ct.id 
       WHERE c.id = ?`,
      [id]
    );
    
    const cluster = {
      id: rows[0].id,
      name: rows[0].name,
      cityId: rows[0].city_id,
      cityName: rows[0].city_name,
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at
    };
    
    res.json(cluster);
  } catch (error) {
    console.error('Error updating cluster:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Cluster name already exists in this city' });
    }
    res.status(500).json({ error: 'Failed to update cluster' });
  }
});

// Delete a cluster
router.delete('/clusters/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { deletedBy } = req.body;
    
    // Get current cluster for audit
    const [currentCluster] = await db.execute(
      `SELECT c.*, ct.name as city_name 
       FROM master_clusters c 
       JOIN master_cities ct ON c.city_id = ct.id 
       WHERE c.id = ?`,
      [id]
    );
    
    if (currentCluster.length === 0) {
      return res.status(404).json({ error: 'Cluster not found' });
    }
    
    await db.execute('DELETE FROM master_clusters WHERE id = ?', [id]);
    
    // Log audit trail
    await logAuditTrail('cluster', id, 'delete', {
      name: currentCluster[0].name,
      cityId: currentCluster[0].city_id,
      cityName: currentCluster[0].city_name
    }, deletedBy);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting cluster:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: 'Cannot delete cluster as it is in use' });
    }
    res.status(500).json({ error: 'Failed to delete cluster' });
  }
});

// AUDIT LOGS ROUTES

// Get audit logs
router.get('/audit-logs', auth, async (req, res) => {
  try {
    const { entityType } = req.query;
    
    let query = `
      SELECT al.*, du.name as user_name 
      FROM master_audit_logs al 
      LEFT JOIN dashboard_users du ON al.created_by = du.id
    `;
    const params = [];
    
    if (entityType) {
      query += ' WHERE al.entity_type = ?';
      params.push(entityType);
    }
    
    query += ' ORDER BY al.created_at DESC LIMIT 100';
    
    const [rows] = await db.execute(query, params);
    
    const auditLogs = rows.map(row => ({
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      action: row.action,
      changes: typeof row.changes === 'string' ? JSON.parse(row.changes) : row.changes,
      createdBy: row.created_by,
      userName: row.user_name,
      createdAt: row.created_at
    }));
    
    res.json(auditLogs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;
