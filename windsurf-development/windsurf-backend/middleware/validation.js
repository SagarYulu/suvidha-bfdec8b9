
const Joi = require('joi');

// Enhanced validation middleware with comprehensive schemas
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
    
    next();
  };
};

// Comprehensive validation schemas
const schemas = {
  // User schemas
  createUser: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      }),
    role: Joi.string().valid('admin', 'agent', 'employee').required(),
    employee_id: Joi.string().alphanum().max(20).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
    city: Joi.string().max(50).optional(),
    cluster: Joi.string().max(50).optional(),
    manager: Joi.string().max(100).optional()
  }),

  updateUser: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    role: Joi.string().valid('admin', 'agent', 'employee').optional(),
    employee_id: Joi.string().alphanum().max(20).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
    city: Joi.string().max(50).optional(),
    cluster: Joi.string().max(50).optional(),
    manager: Joi.string().max(100).optional(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).optional()
  }),

  // Issue schemas
  createIssue: Joi.object({
    type_id: Joi.string().required(),
    sub_type_id: Joi.string().required(),
    description: Joi.string().min(10).max(2000).required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    attachments: Joi.array().items(Joi.string().uri()).max(5).optional(),
    expected_resolution: Joi.date().optional(),
    category: Joi.string().max(100).optional()
  }),

  updateIssue: Joi.object({
    status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed').optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    assigned_to: Joi.string().uuid().optional(),
    mapped_type_id: Joi.string().optional(),
    mapped_sub_type_id: Joi.string().optional(),
    resolution_notes: Joi.string().max(1000).optional(),
    estimated_hours: Joi.number().positive().max(1000).optional()
  }),

  // Comment schemas
  addComment: Joi.object({
    content: Joi.string().min(1).max(1000).required(),
    is_internal: Joi.boolean().default(false),
    attachments: Joi.array().items(Joi.string().uri()).max(3).optional()
  }),

  // Authentication schemas
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  changePassword: Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
    confirm_password: Joi.string().valid(Joi.ref('new_password')).required()
      .messages({
        'any.only': 'Passwords do not match'
      })
  }),

  // Feedback schemas
  submitFeedback: Joi.object({
    issue_id: Joi.string().uuid().required(),
    sentiment: Joi.string().valid('positive', 'neutral', 'negative').required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    feedback_option: Joi.string().max(100).required(),
    comments: Joi.string().max(500).optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
  })
};

// Sanitization helpers
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};

const sanitizeRequest = (req, res, next) => {
  req.body = sanitizeInput(req.body);
  req.query = sanitizeInput(req.query);
  req.params = sanitizeInput(req.params);
  next();
};

module.exports = {
  validateRequest,
  schemas,
  sanitizeRequest
};
