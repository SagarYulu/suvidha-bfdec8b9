
const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Invalid input data',
      details: errors.array()
    });
  }
  next();
};

const validationRules = {
  // User validation rules
  userRegistration: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('full_name').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('role').isIn(['admin', 'manager', 'agent', 'employee']).withMessage('Invalid role')
  ],

  userLogin: [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],

  // Issue validation rules
  createIssue: [
    body('title').optional().trim().isLength({ min: 3, max: 500 }),
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('issue_type').notEmpty().withMessage('Issue type is required'),
    body('issue_subtype').notEmpty().withMessage('Issue subtype is required'),
    body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('employee_id').isUUID().withMessage('Invalid employee ID')
  ],

  updateIssue: [
    param('id').isUUID().withMessage('Invalid issue ID'),
    body('title').optional().trim().isLength({ min: 3, max: 500 }),
    body('description').optional().trim().isLength({ min: 10 }),
    body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed', 'pending', 'escalated']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
  ],

  // Comment validation rules
  createComment: [
    param('id').isUUID().withMessage('Invalid issue ID'),
    body('content').trim().isLength({ min: 1 }).withMessage('Comment content is required')
  ],

  // Query parameter validation
  paginationQuery: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sort_by').optional().isIn(['created_at', 'updated_at', 'priority', 'status']),
    query('sort_order').optional().isIn(['asc', 'desc'])
  ]
};

module.exports = {
  validationRules,
  handleValidationErrors
};
