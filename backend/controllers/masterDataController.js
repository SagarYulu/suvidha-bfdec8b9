
const { getPool } = require('../config/database');
const { HTTP_STATUS } = require('../config/constants');

class MasterDataController {
  async getCities(req, res) {
    try {
      const pool = getPool();
      const [cities] = await pool.execute('SELECT * FROM master_cities ORDER BY name');
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Cities retrieved successfully',
        data: cities
      });
    } catch (error) {
      console.error('Get cities error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve cities',
        message: error.message
      });
    }
  }

  async getClusters(req, res) {
    try {
      const pool = getPool();
      const { cityId } = req.query;
      
      let query = `
        SELECT c.*, city.name as city_name 
        FROM master_clusters c
        LEFT JOIN master_cities city ON c.city_id = city.id
      `;
      const params = [];
      
      if (cityId) {
        query += ' WHERE c.city_id = ?';
        params.push(cityId);
      }
      
      query += ' ORDER BY c.name';
      
      const [clusters] = await pool.execute(query, params);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Clusters retrieved successfully',
        data: clusters
      });
    } catch (error) {
      console.error('Get clusters error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve clusters',
        message: error.message
      });
    }
  }

  async getRoles(req, res) {
    try {
      const pool = getPool();
      const [roles] = await pool.execute('SELECT * FROM master_roles ORDER BY name');
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Roles retrieved successfully',
        data: roles
      });
    } catch (error) {
      console.error('Get roles error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve roles',
        message: error.message
      });
    }
  }

  async createCity(req, res) {
    try {
      const { name } = req.body;
      const pool = getPool();
      
      const cityId = require('uuid').v4();
      await pool.execute(
        'INSERT INTO master_cities (id, name) VALUES (?, ?)',
        [cityId, name]
      );
      
      const [city] = await pool.execute('SELECT * FROM master_cities WHERE id = ?', [cityId]);
      
      res.status(HTTP_STATUS.CREATED).json({
        message: 'City created successfully',
        data: city[0]
      });
    } catch (error) {
      console.error('Create city error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to create city',
        message: error.message
      });
    }
  }

  async createCluster(req, res) {
    try {
      const { name, city_id } = req.body;
      const pool = getPool();
      
      const clusterId = require('uuid').v4();
      await pool.execute(
        'INSERT INTO master_clusters (id, name, city_id) VALUES (?, ?, ?)',
        [clusterId, name, city_id]
      );
      
      const [cluster] = await pool.execute(
        `SELECT c.*, city.name as city_name 
         FROM master_clusters c
         LEFT JOIN master_cities city ON c.city_id = city.id
         WHERE c.id = ?`,
        [clusterId]
      );
      
      res.status(HTTP_STATUS.CREATED).json({
        message: 'Cluster created successfully',
        data: cluster[0]
      });
    } catch (error) {
      console.error('Create cluster error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to create cluster',
        message: error.message
      });
    }
  }
}

module.exports = new MasterDataController();
