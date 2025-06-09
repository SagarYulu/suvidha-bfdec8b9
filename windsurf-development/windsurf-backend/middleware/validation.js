
const { body, param, query, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/responseHelper');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array());
  }
  next();
};

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const validateMobileLogin = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .trim()
];

const validateCreateUser = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['admin', 'manager', 'agent', 'employee'])
    .withMessage('Invalid role')
];

const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'agent', 'employee'])
    .withMessage('Invalid role')
];

const validateCreateIssue = [
  body('employee_uuid')
    .isUUID()
    .withMessage('Valid employee UUID is required'),
  body('type_id')
    .notEmpty()
    .withMessage('Issue type is required'),
  body('sub_type_id')
    .notEmpty()
    .withMessage('Issue sub-type is required'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority level')
];

const validateUpdateIssue = [
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority level'),
  body('assigned_to')
    .optional()
    .isUUID()
    .withMessage('Valid assignee UUID is required')
];

const validateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
];

const validateUUIDParam = (paramName) => [
  param(paramName)
    .isUUID()
    .withMessage(`Invalid ${paramName} format`)
];

const validatePagination = () => [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

module.exports = {
  handleValidationErrors,
  validateLogin,
  validateMobileLogin,
  validateCreateUser,
  validateUpdateUser,
  validateCreateIssue,
  validateUpdateIssue,
  validateComment,
  validateUUIDParam,
  validatePagination
};
