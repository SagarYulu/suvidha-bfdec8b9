
const CSVProcessingService = require('../services/csvProcessingService');
const User = require('../models/User');
const Employee = require('../models/Employee');
const AuditService = require('../services/auditService');
const { HTTP_STATUS } = require('../config/constants');

class BulkUploadController {
  async uploadDashboardUsers(req, res) {
    try {
      if (!req.file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'No CSV file uploaded'
        });
      }

      const results = await CSVProcessingService.processDashboardUsersCSV(req.file.buffer);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'CSV processed successfully',
        data: results
      });
    } catch (error) {
      console.error('CSV processing error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to process CSV file',
        message: error.message
      });
    }
  }

  async commitDashboardUsers(req, res) {
    try {
      const { users } = req.body;
      
      if (!users || !Array.isArray(users)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Invalid user data'
        });
      }

      const createdUsers = [];
      const errors = [];

      for (const userData of users) {
        try {
          const user = await User.create(userData);
          createdUsers.push(user);

          // Log audit event
          await AuditService.logDashboardUserAudit(
            user.id,
            'create',
            { bulk_upload: true, created_data: userData },
            req.user.id,
            req
          );
        } catch (error) {
          errors.push({
            user: userData,
            error: error.message
          });
        }
      }

      res.status(HTTP_STATUS.CREATED).json({
        message: `Successfully created ${createdUsers.length} users`,
        data: {
          created: createdUsers,
          errors: errors,
          summary: {
            total: users.length,
            created: createdUsers.length,
            failed: errors.length
          }
        }
      });
    } catch (error) {
      console.error('Bulk user creation error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to create users',
        message: error.message
      });
    }
  }

  async uploadEmployees(req, res) {
    try {
      if (!req.file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'No CSV file uploaded'
        });
      }

      const results = await CSVProcessingService.processEmployeesCSV(req.file.buffer);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'CSV processed successfully',
        data: results
      });
    } catch (error) {
      console.error('CSV processing error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to process CSV file',
        message: error.message
      });
    }
  }

  async commitEmployees(req, res) {
    try {
      const { employees } = req.body;
      
      if (!employees || !Array.isArray(employees)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Invalid employee data'
        });
      }

      const createdEmployees = [];
      const errors = [];

      for (const employeeData of employees) {
        try {
          const employee = await Employee.create(employeeData);
          createdEmployees.push(employee);

          // Log audit event
          await AuditService.logUserAudit(
            employee.id,
            'create',
            { bulk_upload: true, created_data: employeeData },
            req.user.id,
            req
          );
        } catch (error) {
          errors.push({
            employee: employeeData,
            error: error.message
          });
        }
      }

      res.status(HTTP_STATUS.CREATED).json({
        message: `Successfully created ${createdEmployees.length} employees`,
        data: {
          created: createdEmployees,
          errors: errors,
          summary: {
            total: employees.length,
            created: createdEmployees.length,
            failed: errors.length
          }
        }
      });
    } catch (error) {
      console.error('Bulk employee creation error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to create employees',
        message: error.message
      });
    }
  }

  async getCSVTemplate(req, res) {
    try {
      const { type } = req.params;
      
      const template = CSVProcessingService.generateCSVTemplate(type);
      
      if (!template) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Invalid template type'
        });
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_template.csv"`);
      res.send(template);
    } catch (error) {
      console.error('Template generation error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to generate template',
        message: error.message
      });
    }
  }
}

module.exports = new BulkUploadController();
