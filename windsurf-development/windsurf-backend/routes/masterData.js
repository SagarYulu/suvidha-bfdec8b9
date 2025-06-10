
const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');

// ROLES ROUTES
router.get('/roles', auth, masterDataController.getRoles);
router.post('/roles', auth, validation.validateMasterData, masterDataController.createRole);
router.put('/roles/:id', auth, validation.validateMasterData, masterDataController.updateRole);
router.delete('/roles/:id', auth, masterDataController.deleteRole);

// CITIES ROUTES
router.get('/cities', auth, masterDataController.getCities);
router.post('/cities', auth, validation.validateMasterData, masterDataController.createCity);
router.put('/cities/:id', auth, validation.validateMasterData, masterDataController.updateCity);
router.delete('/cities/:id', auth, masterDataController.deleteCity);

// CLUSTERS ROUTES
router.get('/clusters', auth, masterDataController.getClusters);
router.post('/clusters', auth, validation.validateClusterData, masterDataController.createCluster);
router.put('/clusters/:id', auth, validation.validateClusterData, masterDataController.updateCluster);
router.delete('/clusters/:id', auth, masterDataController.deleteCluster);

// AUDIT LOGS ROUTES
router.get('/audit-logs', auth, masterDataController.getAuditLogs);

module.exports = router;
