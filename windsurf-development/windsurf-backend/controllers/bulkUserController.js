
const bulkUserService = require('../services/bulkUserService');
const { validationResult } = require('express-validator');

class BulkUserController {
  async bulkCreateUsers(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { users } = req.body;
      const createdBy = req.user.id;
      
      const result = await bulkUserService.bulkCreateUsers(users, createdBy);
      
      res.json({
        success: true,
        data: result,
        message: `Processed ${result.totalProcessed} users. ${result.successCount} created successfully, ${result.errorCount} failed.`
      });
    } catch (error) {
      console.error('Bulk create users error:', error);
      res.status(500).json({ 
        error: 'Failed to bulk create users',
        message: error.message 
      });
    }
  }

  async validateBulkUsers(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { users } = req.body;
      
      const validation = await bulkUserService.validateUsers(users);
      
      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('Validate bulk users error:', error);
      res.status(500).json({ 
        error: 'Failed to validate bulk users',
        message: error.message 
      });
    }
  }
}

module.exports = new BulkUserController();
