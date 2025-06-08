
const { body, param, query, validationResult } = require('express-validator');

class ValidationMiddleware {
  // Handle validation results
  static handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
          value: err.value
        }))
      });
    }
    next();
  }

  // User validation rules
  static validateUser() {
    return [
      body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
      body('phone')
        .optional()
        .matches(/^[+]?[\d\s\-\(\)]{10,15}$/)
        .withMessage('Please provide a valid phone number'),
      body('role')
        .isIn(['admin', 'agent', 'employee', 'manager'])
        .withMessage('Invalid role specified')
    ];
  }

  // Issue validation rules
  static validateIssue() {
    return [
      body('typeId')
        .notEmpty()
        .withMessage('Issue type is required'),
      body('subTypeId')
        .notEmpty()
        .withMessage('Issue sub-type is required'),
      body('description')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
      body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Invalid priority level'),
      body('employeeUuid')
        .isUUID()
        .withMessage('Valid employee UUID is required')
    ];
  }

  // Issue update validation
  static validateIssueUpdate() {
    return [
      body('status')
        .optional()
        .isIn(['open', 'in_progress', 'pending', 'resolved', 'closed'])
        .withMessage('Invalid status'),
      body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Invalid priority level'),
      body('assignedTo')
        .optional()
        .isUUID()
        .withMessage('Invalid assignee ID'),
      body('mappedTypeId')
        .optional()
        .notEmpty()
        .withMessage('Mapped type cannot be empty'),
      body('mappedSubTypeId')
        .optional()
        .notEmpty()
        .withMessage('Mapped sub-type cannot be empty')
    ];
  }

  // Comment validation
  static validateComment() {
    return [
      body('content')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comment must be between 1 and 1000 characters')
    ];
  }

  // Feedback validation
  static validateFeedback() {
    return [
      body('type')
        .isIn(['suggestion', 'complaint', 'appreciation', 'inquiry'])
        .withMessage('Invalid feedback type'),
      body('message')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Message must be between 10 and 2000 characters'),
      body('rating')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
      body('sentiment')
        .optional()
        .isIn(['positive', 'negative', 'neutral'])
        .withMessage('Invalid sentiment value')
    ];
  }

  // Login validation
  static validateLogin() {
    return [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
      body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
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
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
    ];
  }

  // Parameter validation
  static validateUUIDParam(paramName = 'id') {
    return [
      param(paramName)
        .isUUID()
        .withMessage(`Invalid ${paramName} format`)
    ];
  }

  // Query validation for pagination
  static validatePagination() {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      query('search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Search term too long')
    ];
  }

  // Date range validation
  static validateDateRange() {
    return [
      query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid start date format'),
      query('endDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid end date format')
    ];
  }

  // File upload validation
  static validateFileUpload() {
    return [
      body('category')
        .optional()
        .isIn(['attachments', 'issues', 'temp'])
        .withMessage('Invalid file category')
    ];
  }

  // Sanitize input middleware
  static sanitizeInput(req, res, next) {
    // Remove potentially harmful characters
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
    };

    // Recursively sanitize object
    const sanitizeObject = (obj) => {
      if (obj && typeof obj === 'object') {
        for (const key in obj) {
          if (Array.isArray(obj[key])) {
            obj[key] = obj[key].map(item => 
              typeof item === 'string' ? sanitizeString(item) : sanitizeObject(item)
            );
          } else if (typeof obj[key] === 'object') {
            sanitizeObject(obj[key]);
          } else if (typeof obj[key] === 'string') {
            obj[key] = sanitizeString(obj[key]);
          }
        }
      }
      return obj;
    };

    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
    req.params = sanitizeObject(req.params);

    next();
  }
}

module.exports = ValidationMiddleware;
