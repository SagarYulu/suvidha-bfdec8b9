
const { body } = require('express-validator');

const authValidators = {
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ]
};

const userValidators = {
  create: [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'agent', 'employee']).withMessage('Valid role is required')
  ]
};

module.exports = {
  authValidators,
  userValidators
};
