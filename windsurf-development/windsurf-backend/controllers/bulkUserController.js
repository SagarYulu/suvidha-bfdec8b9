
const bulkUserService = require('../services/bulkUserService');
const emailService = require('../services/emailService');

class BulkUserController {
  async bulkCreateUsers(req, res) {
    try {
      const { users } = req.body;
      const createdBy = req.user.id;
      
      if (!users || !Array.isArray(users) || users.length === 0) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Users array is required and must not be empty'
        });
      }
      
      const result = await bulkUserService.bulkCreateUsers(users, createdBy);
      
      // Send welcome emails for successfully created users
      for (const user of result.success) {
        if (user.tempPassword) {
          try {
            await emailService.sendWelcomeEmail(
              user.email,
              user.name || 'User',
              user.tempPassword
            );
          } catch (emailError) {
            console.error(`Failed to send welcome email to ${user.email}:`, emailError);
          }
        }
      }
      
      res.status(201).json({
        success: true,
        data: result,
        message: `Processed ${result.totalProcessed} users. ${result.successCount} created successfully, ${result.errorCount} failed.`
      });
    } catch (error) {
      console.error('Bulk create users error:', error);
      res.status(500).json({
        error: 'Failed to create users in bulk',
        message: error.message
      });
    }
  }

  async validateBulkUsers(req, res) {
    try {
      const { users } = req.body;
      
      if (!users || !Array.isArray(users)) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Users array is required'
        });
      }
      
      const validationErrors = [];
      const validUsers = [];
      
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const rowErrors = [];
        
        if (!user.name || !user.name.trim()) {
          rowErrors.push('Name is required');
        }
        
        if (!user.email || !user.email.trim()) {
          rowErrors.push('Email is required');
        } else if (!/\S+@\S+\.\S+/.test(user.email)) {
          rowErrors.push('Invalid email format');
        }
        
        if (!user.employee_id || !user.employee_id.trim()) {
          rowErrors.push('Employee ID is required');
        }
        
        if (rowErrors.length > 0) {
          validationErrors.push({
            row: i + 1,
            data: user,
            errors: rowErrors
          });
        } else {
          validUsers.push(user);
        }
      }
      
      res.json({
        success: true,
        data: {
          validUsers: validUsers.length,
          totalUsers: users.length,
          errors: validationErrors
        }
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
