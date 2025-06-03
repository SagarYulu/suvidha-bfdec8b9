
const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  };
};

// Validation schemas
const schemas = {
  adminLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  employeeLogin: Joi.object({
    employeeId: Joi.string().required(),
    password: Joi.string().required()
  }),

  createIssue: Joi.object({
    typeId: Joi.string().required(),
    subTypeId: Joi.string().required(),
    description: Joi.string().min(10).required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium')
  }),

  updateIssueStatus: Joi.object({
    status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed').required()
  }),

  assignIssue: Joi.object({
    assignedTo: Joi.string().uuid().required()
  }),

  addComment: Joi.object({
    content: Joi.string().min(1).required()
  }),

  createUser: Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'manager', 'agent').required(),
    city: Joi.string().optional(),
    cluster: Joi.string().optional(),
    manager: Joi.string().optional()
  })
};

module.exports = {
  validateRequest,
  schemas
};
