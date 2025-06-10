
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class MasterDataService {
  // ROLES SERVICES
  async getAllRoles() {
    const [rows] = await db.execute(
      'SELECT * FROM master_roles ORDER BY name ASC'
    );
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async getRoleById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM master_roles WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) return null;
    
    return {
      id: rows[0].id,
      name: rows[0].name,
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at
    };
  }

  async createRole(name, createdBy) {
    const roleId = uuidv4();
    
    await db.execute(
      'INSERT INTO master_roles (id, name) VALUES (?, ?)',
      [roleId, name]
    );
    
    return this.getRoleById(roleId);
  }

  async updateRole(id, name) {
    await db.execute(
      'UPDATE master_roles SET name = ? WHERE id = ?',
      [name, id]
    );
    
    return this.getRoleById(id);
  }

  async deleteRole(id) {
    await db.execute('DELETE FROM master_roles WHERE id = ?', [id]);
    return true;
  }

  // CITIES SERVICES
  async getAllCities() {
    const [rows] = await db.execute(
      'SELECT * FROM master_cities ORDER BY name ASC'
    );
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async getCityById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM master_cities WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) return null;
    
    return {
      id: rows[0].id,
      name: rows[0].name,
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at
    };
  }

  async createCity(name, createdBy) {
    const cityId = uuidv4();
    
    await db.execute(
      'INSERT INTO master_cities (id, name) VALUES (?, ?)',
      [cityId, name]
    );
    
    return this.getCityById(cityId);
  }

  async updateCity(id, name) {
    await db.execute(
      'UPDATE master_cities SET name = ? WHERE id = ?',
      [name, id]
    );
    
    return this.getCityById(id);
  }

  async deleteCity(id) {
    await db.execute('DELETE FROM master_cities WHERE id = ?', [id]);
    return true;
  }

  // CLUSTERS SERVICES
  async getAllClusters(cityId = null) {
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
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      cityId: row.city_id,
      cityName: row.city_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async getClusterById(id) {
    const [rows] = await db.execute(
      `SELECT c.*, ct.name as city_name 
       FROM master_clusters c 
       JOIN master_cities ct ON c.city_id = ct.id 
       WHERE c.id = ?`,
      [id]
    );
    
    if (rows.length === 0) return null;
    
    return {
      id: rows[0].id,
      name: rows[0].name,
      cityId: rows[0].city_id,
      cityName: rows[0].city_name,
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at
    };
  }

  async createCluster(name, cityId, createdBy) {
    const clusterId = uuidv4();
    
    await db.execute(
      'INSERT INTO master_clusters (id, name, city_id) VALUES (?, ?, ?)',
      [clusterId, name, cityId]
    );
    
    return this.getClusterById(clusterId);
  }

  async updateCluster(id, name, cityId) {
    await db.execute(
      'UPDATE master_clusters SET name = ?, city_id = ? WHERE id = ?',
      [name, cityId, id]
    );
    
    return this.getClusterById(id);
  }

  async deleteCluster(id) {
    await db.execute('DELETE FROM master_clusters WHERE id = ?', [id]);
    return true;
  }
}

module.exports = new MasterDataService();
