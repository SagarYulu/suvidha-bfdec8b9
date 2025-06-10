
const { body, param, query, validationResult } = require('express-validator');

class ValidationMiddleware {
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

  static validateIssue() {
    return [
      body('employee_uuid').notEmpty().withMessage('Employee UUID is required'),
      body('type_id').notEmpty().withMessage('Issue type is required'),
      body('sub_type_id').notEmpty().withMessage('Issue sub-type is required'),
      body('description').notEmpty().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
      body('priority').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority level'),
      body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status')
    ];
  }

  static validateIssueUpdate() {
    return [
      body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status'),
      body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
      body('assigned_to').optional().isUUID().withMessage('Invalid assignee ID')
    ];
  }

  static validateComment() {
    return [
      body('content').notEmpty().isLength({ min: 1, max: 2000 }).withMessage('Comment content is required and must be less than 2000 characters')
    ];
  }

  static validateFeedback() {
    return [
      body('issue_id').isUUID().withMessage('Valid issue ID is required'),
      body('feedback_option').isIn(['😊', '😐', '😞']).withMessage('Feedback must be one of: 😊, 😐, 😞'),
      body('sentiment').optional().isIn(['positive', 'neutral', 'negative']).withMessage('Invalid sentiment value')
    ];
  }

  static validateFileUpload() {
    return [
      body('category').optional().isIn(['attachments', 'profile', 'documents']).withMessage('Invalid file category')
    ];
  }

  static validateUUIDParam(paramName) {
    return [
      param(paramName).isUUID().withMessage(`${paramName} must be a valid UUID`)
    ];
  }

  static validatePagination() {
    return [
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    ];
  }

  static validateLogin() {
    return [
      body('mobile').notEmpty().isMobilePhone().withMessage('Valid mobile number is required'),
      body('dateOfBirth').notEmpty().isDate().withMessage('Valid date of birth is required')
    ];
  }

  static validateEmployeeCreation() {
    return [
      body('name').notEmpty().isLength({ min: 2 }).withMessage('Name is required and must be at least 2 characters'),
      body('email').isEmail().withMessage('Valid email is required'),
      body('emp_id').notEmpty().withMessage('Employee ID is required'),
      body('phone').notEmpty().isMobilePhone().withMessage('Valid mobile number is required'),
      body('role').notEmpty().withMessage('Role is required'),
      body('city').notEmpty().withMessage('City is required'),
      body('cluster').optional().isString().withMessage('Cluster must be a string')
    ];
  }
}

module.exports = ValidationMiddleware;
