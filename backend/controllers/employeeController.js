const Employee = require('../models/Employee');
const Joi = require('joi');

// Validation schema for employee creation
const createEmployeeSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[+]?[0-9\-\s()]{10,15}$/),
  emp_id: Joi.string().required(),
  city: Joi.string().max(100),
  cluster: Joi.string().max(100),
  manager: Joi.string().max(255),
  role: Joi.string().max(100),
  password: Joi.string().min(4).required(),
  date_of_joining: Joi.date(),
  blood_group: Joi.string().max(10),
  date_of_birth: Joi.date(),
  account_number: Joi.string().max(50),
  ifsc_code: Joi.string().max(20),
  user_id: Joi.number().integer()
});

// Validation schema for employee updates
const updateEmployeeSchema = Joi.object({
  name: Joi.string().min(2).max(255),
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^[+]?[0-9\-\s()]{10,15}$/),
  emp_id: Joi.string(),
  city: Joi.string().max(100),
  cluster: Joi.string().max(100),
  manager: Joi.string().max(255),
  role: Joi.string().max(100),
  password: Joi.string().min(4),
  date_of_joining: Joi.date(),
  blood_group: Joi.string().max(10),
  date_of_birth: Joi.date(),
  account_number: Joi.string().max(50),
  ifsc_code: Joi.string().max(20)
});

// Get all employees
const getEmployees = async (req, res, next) => {
  try {
    const { city, cluster, role, search, page = 1, limit = 50 } = req.query;
    
    const filters = {};
    if (city) filters.city = city;
    if (cluster) filters.cluster = cluster;
    if (role) filters.role = role;
    if (search) filters.search = search;

    const employees = await Employee.findAll(filters);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedEmployees = employees.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        employees: paginatedEmployees,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(employees.length / limit),
          count: employees.length,
          perPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get employee by ID
const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid employee ID is required'
      });
    }

    const employee = await Employee.findById(parseInt(id));
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: { employee }
    });
  } catch (error) {
    next(error);
  }
};

// Create new employee
const createEmployee = async (req, res, next) => {
  try {
    const { error, value } = createEmployeeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if employee with same email or emp_id already exists
    const existingEmail = await Employee.findByEmail(value.email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }

    const existingEmpId = await Employee.findByEmpId(value.emp_id);
    if (existingEmpId) {
      return res.status(409).json({
        success: false,
        message: 'Employee with this employee ID already exists'
      });
    }

    const employee = await Employee.create(value);

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: { employee }
    });
  } catch (error) {
    next(error);
  }
};

// Update employee
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid employee ID is required'
      });
    }

    const { error, value } = updateEmployeeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if employee exists
    const existingEmployee = await Employee.findById(parseInt(id));
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check for duplicate email or emp_id if they're being updated
    if (value.email && value.email !== existingEmployee.email) {
      const emailExists = await Employee.findByEmail(value.email);
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Employee with this email already exists'
        });
      }
    }

    if (value.emp_id && value.emp_id !== existingEmployee.emp_id) {
      const empIdExists = await Employee.findByEmpId(value.emp_id);
      if (empIdExists) {
        return res.status(409).json({
          success: false,
          message: 'Employee with this employee ID already exists'
        });
      }
    }

    const employee = await Employee.update(parseInt(id), value);

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: { employee }
    });
  } catch (error) {
    next(error);
  }
};

// Delete employee
const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid employee ID is required'
      });
    }

    const employee = await Employee.findById(parseInt(id));
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const deleted = await Employee.delete(parseInt(id));
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete employee'
      });
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get employee statistics
const getEmployeeStats = async (req, res, next) => {
  try {
    const stats = await Employee.getStats();

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

// Bulk create employees
const bulkCreateEmployees = async (req, res, next) => {
  try {
    const { employees } = req.body;

    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Array of employees is required'
      });
    }

    const results = {
      success: [],
      errors: []
    };

    for (let i = 0; i < employees.length; i++) {
      try {
        const { error, value } = createEmployeeSchema.validate(employees[i]);
        if (error) {
          results.errors.push({
            index: i,
            data: employees[i],
            error: error.details[0].message
          });
          continue;
        }

        // Check for duplicates
        const existingEmail = await Employee.findByEmail(value.email);
        const existingEmpId = await Employee.findByEmpId(value.emp_id);

        if (existingEmail || existingEmpId) {
          results.errors.push({
            index: i,
            data: employees[i],
            error: 'Employee with this email or employee ID already exists'
          });
          continue;
        }

        const employee = await Employee.create(value);
        results.success.push({
          index: i,
          employee
        });
      } catch (error) {
        results.errors.push({
          index: i,
          data: employees[i],
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Bulk operation completed. ${results.success.length} employees created, ${results.errors.length} errors`,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  bulkCreateEmployees
};