
const express = require('express');
const exportService = require('../services/exportService');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Export issues
router.get('/issues', 
  authenticateToken, 
  requireRole(['admin', 'manager', 'support']),
  async (req, res) => {
    try {
      const { format = 'csv', ...filters } = req.query;
      
      const result = await exportService.exportIssues(format, filters);
      
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Type', result.contentType);
      
      res.send(result.data);
    } catch (error) {
      console.error('Export issues error:', error);
      res.status(500).json({ 
        error: 'Failed to export issues',
        message: error.message 
      });
    }
  }
);

// Export users
router.get('/users', 
  authenticateToken, 
  requireRole(['admin', 'manager']),
  async (req, res) => {
    try {
      const { format = 'csv', ...filters } = req.query;
      
      const result = await exportService.exportUsers(format, filters);
      
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Type', result.contentType);
      
      res.send(result.data);
    } catch (error) {
      console.error('Export users error:', error);
      res.status(500).json({ 
        error: 'Failed to export users',
        message: error.message 
      });
    }
  }
);

module.exports = router;
