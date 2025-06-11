
const Employee = require('../models/Employee');
const { HTTP_STATUS } = require('../config/constants');

class EmployeeController {
  async getAllEmployees(req, res) {
    try {
      const filters = req.query;
      const employees = await Employee.findAll(filters);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Employees retrieved successfully',
        data: employees
      });
    } catch (error) {
      console.error('Get employees error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve employees',
        message: error.message
      });
    }
  }

  async getEmployeeById(req, res) {
    try {
      const { id } = req.params;
      const employee = await Employee.findById(id);
      
      if (!employee) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Employee not found'
        });
      }
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Employee retrieved successfully',
        data: employee
      });
    } catch (error) {
      console.error('Get employee error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve employee',
        message: error.message
      });
    }
  }

  async createEmployee(req, res) {
    try {
      const employeeData = req.body;
      
      // Check if employee already exists
      const existingEmployee = await Employee.findByEmail(employeeData.emp_email);
      if (existingEmployee) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          error: 'Employee with this email already exists'
        });
      }

      const existingCode = await Employee.findByCode(employeeData.emp_code);
      if (existingCode) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          error: 'Employee with this code already exists'
        });
      }
      
      const employee = await Employee.create(employeeData);
      
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Employee created successfully',
        data: employee
      });
    } catch (error) {
      console.error('Create employee error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to create employee',
        message: error.message
      });
    }
  }

  async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const employee = await Employee.findById(id);
      if (!employee) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Employee not found'
        });
      }
      
      const updatedEmployee = await Employee.update(id, updates);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Employee updated successfully',
        data: updatedEmployee
      });
    } catch (error) {
      console.error('Update employee error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to update employee',
        message: error.message
      });
    }
  }

  async deleteEmployee(req, res) {
    try {
      const { id } = req.params;
      
      const employee = await Employee.findById(id);
      if (!employee) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Employee not found'
        });
      }
      
      await Employee.delete(id);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Employee deleted successfully'
      });
    } catch (error) {
      console.error('Delete employee error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to delete employee',
        message: error.message
      });
    }
  }

  async bulkUpload(req, res) {
    try {
      const employees = req.body.employees;
      
      if (!Array.isArray(employees)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Invalid data format. Expected array of employees.'
        });
      }
      
      const results = [];
      const errors = [];
      
      for (let i = 0; i < employees.length; i++) {
        try {
          const employee = await Employee.create(employees[i]);
          results.push(employee);
        } catch (error) {
          errors.push({
            row: i + 1,
            data: employees[i],
            error: error.message
          });
        }
      }
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Bulk upload completed',
        data: {
          successful: results.length,
          failed: errors.length,
          results,
          errors
        }
      });
    } catch (error) {
      console.error('Bulk upload error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to process bulk upload',
        message: error.message
      });
    }
  }
}

module.exports = new EmployeeController();
