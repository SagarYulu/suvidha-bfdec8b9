
const { body, validationResult } = require('express-validator');

const validationRules = {
  login: [
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],

  register: [
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('full_name')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Full name must be at least 2 characters long'),
    body('role')
      .isIn(['admin', 'manager', 'agent', 'employee'])
      .withMessage('Invalid role')
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
  ],

  forgotPassword: [
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail()
  ],

  resetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],

  createIssue: [
    body('description')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Description must be at least 10 characters long'),
    body('issue_type')
      .notEmpty()
      .withMessage('Issue type is required'),
    body('issue_subtype')
      .notEmpty()
      .withMessage('Issue subtype is required'),
    body('priority')
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority'),
    body('employee_id')
      .notEmpty()
      .withMessage('Employee ID is required')
  ],

  updateIssue: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Title cannot be empty if provided'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage('Description must be at least 10 characters long'),
    body('status')
      .optional()
      .isIn(['open', 'in_progress', 'resolved', 'closed', 'pending', 'escalated'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority')
  ],

  addComment: [
    body('content')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Comment content is required')
  ]
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  
  next();
};

module.exports = {
  validationRules,
  handleValidationErrors
};
