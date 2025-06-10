
const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authMiddleware = require('../middlewares/auth');

// All routes require authentication and admin privileges
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize(['admin', 'super_admin']));

// Get audit logs
router.get('/', auditController.getAuditLogs);

// Get audit statistics
router.get('/stats', auditController.getAuditStats);

// Get audit logs for specific entity
router.get('/entity/:entityType/:entityId', auditController.getEntityAuditLogs);

// Cleanup old audit logs
router.delete('/cleanup', auditController.cleanupOldAuditLogs);

module.exports = router;
