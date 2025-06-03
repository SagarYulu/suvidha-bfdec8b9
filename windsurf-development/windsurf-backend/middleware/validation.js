
const Joi = require('joi');

// Issue validation schemas
const createIssueSchema = Joi.object({
  type_id: Joi.string().required().messages({
    'string.empty': 'Issue type is required',
    'any.required': 'Issue type is required'
  }),
  sub_type_id: Joi.string().required().messages({
    'string.empty': 'Issue sub-type is required',
    'any.required': 'Issue sub-type is required'
  }),
  description: Joi.string().min(10).required().messages({
    'string.min': 'Description must be at least 10 characters long',
    'string.empty': 'Description is required',
    'any.required': 'Description is required'
  }),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  attachments: Joi.array().items(Joi.string()).optional(),
  employee_uuid: Joi.string().optional()
});

const updateIssueSchema = Joi.object({
  status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  assigned_to: Joi.string().allow(null).optional(),
  mapped_type_id: Joi.string().optional(),
  mapped_sub_type_id: Joi.string().optional()
}).min(1);

const commentSchema = Joi.object({
  content: Joi.string().min(1).required().messages({
    'string.min': 'Comment cannot be empty',
    'string.empty': 'Comment content is required',
    'any.required': 'Comment content is required'
  })
});

// User validation schemas
const createUserSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'security-admin', 'agent', 'employee').required(),
  manager: Joi.string().optional(),
  city: Joi.string().optional(),
  cluster: Joi.string().optional(),
  phone: Joi.string().optional(),
  employee_id: Joi.string().optional()
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid('admin', 'security-admin', 'agent', 'employee').optional(),
  manager: Joi.string().allow(null).optional(),
  city: Joi.string().allow(null).optional(),
  cluster: Joi.string().allow(null).optional(),
  phone: Joi.string().allow(null).optional(),
  employee_id: Joi.string().allow(null).optional()
}).min(1);

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessages
      });
    }
    
    req.validatedBody = value;
    next();
  };
};

// Query parameter validation
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        error: 'Query validation failed',
        details: errorMessages
      });
    }
    
    req.validatedQuery = value;
    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  schemas: {
    createIssue: createIssueSchema,
    updateIssue: updateIssueSchema,
    comment: commentSchema,
    createUser: createUserSchema,
    updateUser: updateUserSchema
  }
};
