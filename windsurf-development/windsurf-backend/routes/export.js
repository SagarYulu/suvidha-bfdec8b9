
const express = require('express');
const exportController = require('../controllers/exportController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Export issues data
router.get('/issues', 
  authenticateToken, 
  requireRole(['admin', 'super-admin']), 
  exportController.exportIssues
);

// Export users data
router.get('/users', 
  authenticateToken, 
  requireRole(['admin', 'super-admin']), 
  exportController.exportUsers
);

module.exports = router;
