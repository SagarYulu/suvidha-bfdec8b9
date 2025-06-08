
const { body, param, query, validationResult } = require('express-validator');
const { v4: isUUID } = require('uuid');

class ValidationMiddleware {
  // Handle validation errors
  static handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }

  // UUID parameter validation
  static validateUUIDParam(paramName) {
    return param(paramName)
      .custom((value) => {
        if (!isUUID(value)) {
          throw new Error(`${paramName} must be a valid UUID`);
        }
        return true;
      });
  }

  // Issue validation
  static validateIssue() {
    return [
      body('employee_uuid')
        .notEmpty()
        .withMessage('Employee UUID is required'),
      body('type_id')
        .notEmpty()
        .withMessage('Issue type is required'),
      body('sub_type_id')
        .notEmpty()
        .withMessage('Issue sub-type is required'),
      body('description')
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters'),
      body('priority')
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Priority must be low, medium, high, or urgent'),
      body('status')
        .optional()
        .isIn(['open', 'in_progress', 'resolved', 'closed'])
        .withMessage('Status must be open, in_progress, resolved, or closed')
    ];
  }

  // Issue update validation
  static validateIssueUpdate() {
    return [
      body('status')
        .optional()
        .isIn(['open', 'in_progress', 'resolved', 'closed'])
        .withMessage('Status must be open, in_progress, resolved, or closed'),
      body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Priority must be low, medium, high, or urgent'),
      body('assigned_to')
        .optional()
        .custom((value) => {
          if (value && !isUUID(value)) {
            throw new Error('Assigned user must be a valid UUID');
          }
          return true;
        }),
      body('description')
        .optional()
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters')
    ];
  }

  // Comment validation
  static validateComment() {
    return [
      body('content')
        .notEmpty()
        .withMessage('Comment content is required')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comment must be between 1 and 1000 characters')
    ];
  }

  // User validation
  static validateUser() {
    return [
      body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters'),
      body('email')
        .isEmail()
        .withMessage('Valid email is required'),
      body('employee_id')
        .notEmpty()
        .withMessage('Employee ID is required'),
      body('role')
        .isIn(['admin', 'agent', 'manager', 'employee'])
        .withMessage('Role must be admin, agent, manager, or employee'),
      body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
    ];
  }

  // Login validation
  static validateLogin() {
    return [
      body('email')
        .isEmail()
        .withMessage('Valid email is required'),
      body('password')
        .notEmpty()
        .withMessage('Password is required')
    ];
  }

  // Mobile login validation
  static validateMobileLogin() {
    return [
      body('employeeId')
        .notEmpty()
        .withMessage('Employee ID is required'),
      body('email')
        .isEmail()
        .withMessage('Valid email is required')
    ];
  }

  // Feedback validation
  static validateFeedback() {
    return [
      body('issue_id')
        .custom((value) => {
          if (!isUUID(value)) {
            throw new Error('Issue ID must be a valid UUID');
          }
          return true;
        }),
      body('employee_uuid')
        .notEmpty()
        .withMessage('Employee UUID is required'),
      body('feedback_option')
        .isIn(['excellent', 'good', 'average', 'poor', 'very_poor'])
        .withMessage('Invalid feedback option'),
      body('sentiment')
        .isIn(['positive', 'neutral', 'negative'])
        .withMessage('Sentiment must be positive, neutral, or negative'),
      body('comments')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Comments must not exceed 500 characters')
    ];
  }

  // Pagination validation
  static validatePagination() {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
    ];
  }

  // File upload validation
  static validateFileUpload() {
    return [
      body('category')
        .optional()
        .isIn(['attachments', 'profile_pictures', 'documents'])
        .withMessage('Invalid file category')
    ];
  }

  // Dashboard filters validation
  static validateDashboardFilters() {
    return [
      query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid ISO date'),
      query('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid ISO date'),
      query('status')
        .optional()
        .isIn(['open', 'in_progress', 'resolved', 'closed'])
        .withMessage('Invalid status filter'),
      query('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Invalid priority filter')
    ];
  }
}

module.exports = ValidationMiddleware;
