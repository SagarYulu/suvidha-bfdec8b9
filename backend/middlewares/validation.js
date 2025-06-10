
const { body, param, query, validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../config/constants');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: 'Validation Failed',
      message: 'Invalid input data',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Common validation rules
const validationRules = {
  // User validation
  userRegistration: [
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('full_name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    body('role')
      .isIn(['admin', 'manager', 'agent', 'employee'])
      .withMessage('Invalid role specified')
  ],

  userLogin: [
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  // Issue validation
  issueCreation: [
    body('title')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Title must be between 5 and 200 characters'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('issue_type')
      .isIn(['general', 'bank_account_change', 'technical', 'billing', 'complaint', 'request'])
      .withMessage('Invalid issue type'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority level'),
    body('employee_id')
      .isUUID()
      .withMessage('Invalid employee ID format')
  ],

  issueUpdate: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Title must be between 5 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('status')
      .optional()
      .isIn(['open', 'in_progress', 'resolved', 'closed', 'pending', 'escalated'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority level')
  ],

  // Comment validation
  commentCreation: [
    body('comment_text')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Comment must be between 1 and 1000 characters'),
    body('is_internal')
      .optional()
      .isBoolean()
      .withMessage('is_internal must be a boolean value')
  ],

  // Employee validation
  employeeCreation: [
    body('emp_code')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Employee code must be between 3 and 20 characters'),
    body('emp_name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Employee name must be between 2 and 100 characters'),
    body('emp_email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('emp_mobile')
      .isMobilePhone()
      .withMessage('Must be a valid mobile phone number'),
    body('cluster_id')
      .isUUID()
      .withMessage('Invalid cluster ID format')
  ],

  // Pagination validation
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],

  // UUID parameter validation
  uuidParam: [
    param('id')
      .isUUID()
      .withMessage('Invalid ID format')
  ]
};

module.exports = {
  handleValidationErrors,
  validationRules
};
