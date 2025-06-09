
const { body, validationResult } = require('express-validator');

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

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const validateMobileLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('employeeId').notEmpty().withMessage('Employee ID is required')
];

const validateIssue = [
  body('employee_uuid').notEmpty().withMessage('Employee UUID is required'),
  body('type_id').notEmpty().withMessage('Issue type is required'),
  body('sub_type_id').notEmpty().withMessage('Issue sub-type is required'),
  body('description').notEmpty().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('priority').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority level')
];

const validateComment = [
  body('content').notEmpty().isLength({ min: 1, max: 2000 }).withMessage('Comment content is required and must be less than 2000 characters')
];

const validateMasterData = [
  body('name').notEmpty().withMessage('Name is required')
];

const validateClusterData = [
  body('name').notEmpty().withMessage('Name is required'),
  body('city_id').notEmpty().withMessage('City ID is required')
];

module.exports = {
  handleValidationErrors,
  validateLogin,
  validateMobileLogin,
  validateIssue,
  validateComment,
  validateMasterData,
  validateClusterData
};
