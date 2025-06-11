
const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticateToken);

// Get master data
router.get('/cities', masterDataController.getCities);
router.get('/clusters', masterDataController.getClusters);
router.get('/roles', masterDataController.getRoles);

// Create master data (admin only)
router.post('/cities', requireRole(['admin']), masterDataController.createCity);
router.post('/clusters', requireRole(['admin']), masterDataController.createCluster);

module.exports = router;
