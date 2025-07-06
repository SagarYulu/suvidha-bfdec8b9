
const { body, validationResult } = require('express-validator');

const validationRules = {
  // Auth validation rules
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],

  register: [
    body('full_name').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').isIn(['admin', 'manager', 'agent', 'employee']).withMessage('Invalid role')
  ],

  changePassword: [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
  ],

  forgotPassword: [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
  ],

  resetPassword: [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],

  // Issue validation rules
  createIssue: [
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('issue_type').notEmpty().withMessage('Issue type is required'),
    body('issue_subtype').notEmpty().withMessage('Issue subtype is required'),
    body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('employee_id').notEmpty().withMessage('Employee ID is required')
  ],

  updateIssue: [
    body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed', 'pending', 'escalated']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
  ],

  // Employee validation rules
  createEmployee: [
    body('emp_name').trim().isLength({ min: 2 }).withMessage('Employee name must be at least 2 characters'),
    body('emp_email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('emp_code').trim().isLength({ min: 3 }).withMessage('Employee code must be at least 3 characters'),
    body('role').optional().isIn(['employee', 'manager', 'admin']).withMessage('Invalid role'),
    body('emp_mobile').optional().isMobilePhone().withMessage('Please provide a valid mobile number')
  ],

  updateEmployee: [
    body('emp_name').optional().trim().isLength({ min: 2 }).withMessage('Employee name must be at least 2 characters'),
    body('emp_email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('emp_mobile').optional().isMobilePhone().withMessage('Please provide a valid mobile number'),
    body('role').optional().isIn(['employee', 'manager', 'admin']).withMessage('Invalid role')
  ],

  // Comment validation rules
  addComment: [
    body('content').trim().isLength({ min: 1 }).withMessage('Comment content is required')
  ]
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: 'Please check your input data',
      details: errors.array()
    });
  }
  next();
};

module.exports = {
  validationRules,
  handleValidationErrors
};
