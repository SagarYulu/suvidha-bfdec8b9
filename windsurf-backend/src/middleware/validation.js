
const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  createUser: Joi.object({
    name: Joi.string().required().min(2).max(100),
    email: Joi.string().email().required(),
    employeeId: Joi.string().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/),
    city: Joi.string().required(),
    cluster: Joi.string(),
    role: Joi.string().valid('admin', 'support', 'employee').required(),
    password: Joi.string().min(6).required()
  }),

  updateUser: Joi.object({
    name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    employeeId: Joi.string(),
    phone: Joi.string().pattern(/^[0-9]{10}$/),
    city: Joi.string(),
    cluster: Joi.string(),
    role: Joi.string().valid('admin', 'support', 'employee')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  createIssue: Joi.object({
    typeId: Joi.string().required(),
    subTypeId: Joi.string().required(),
    description: Joi.string().required().min(10),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium')
  }),

  updateIssueStatus: Joi.object({
    status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed').required()
  }),

  assignIssue: Joi.object({
    assignedTo: Joi.string().required()
  }),

  addComment: Joi.object({
    content: Joi.string().required().min(1)
  })
};

module.exports = {
  validateRequest,
  schemas
};
