const Issue = require('../models/Issue');
const Employee = require('../models/Employee');
const Joi = require('joi');

// Validation schemas
const createIssueSchema = Joi.object({
  description: Joi.string().min(10).max(2000).required(),
  status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed').default('open'),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  type_id: Joi.string().required(),
  sub_type_id: Joi.string(),
  employee_uuid: Joi.number().integer().required(),
  assigned_to: Joi.number().integer(),
  attachment_url: Joi.string().uri(),
  attachments: Joi.array().items(Joi.object())
});

const updateIssueSchema = Joi.object({
  description: Joi.string().min(10).max(2000),
  status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed'),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
  type_id: Joi.string(),
  sub_type_id: Joi.string(),
  assigned_to: Joi.number().integer(),
  attachment_url: Joi.string().uri(),
  attachments: Joi.array().items(Joi.object()),
  mapped_type_id: Joi.string(),
  mapped_sub_type_id: Joi.string(),
  mapped_by: Joi.number().integer()
});

// Get all issues
const getIssues = async (req, res, next) => {
  try {
    const {
      status, priority, assigned_to, employee_uuid, city, cluster, type_id,
      startDate, endDate, search, page = 1, limit = 50
    } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (assigned_to) filters.assigned_to = parseInt(assigned_to);
    if (employee_uuid) filters.employee_uuid = parseInt(employee_uuid);
    if (city) filters.city = city;
    if (cluster) filters.cluster = cluster;
    if (type_id) filters.type_id = type_id;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (search) filters.search = search;

    const issues = await Issue.findAll(filters);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedIssues = issues.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        issues: paginatedIssues,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(issues.length / limit),
          count: issues.length,
          perPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get issue by ID
const getIssueById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid issue ID is required'
      });
    }

    const issue = await Issue.findById(parseInt(id));

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    res.json({
      success: true,
      data: { issue }
    });
  } catch (error) {
    next(error);
  }
};

// Create new issue
const createIssue = async (req, res, next) => {
  try {
    const { error, value } = createIssueSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Verify employee exists
    const employee = await Employee.findById(value.employee_uuid);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const issue = await Issue.create(value);

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: { issue }
    });
  } catch (error) {
    next(error);
  }
};

// Update issue
const updateIssue = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid issue ID is required'
      });
    }

    const { error, value } = updateIssueSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if issue exists
    const existingIssue = await Issue.findById(parseInt(id));
    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Add timestamp for status changes
    if (value.status && value.status !== existingIssue.status) {
      if (value.status === 'closed' || value.status === 'resolved') {
        value.closed_at = new Date();
      }
    }

    // Add mapping timestamp
    if (value.mapped_type_id || value.mapped_sub_type_id) {
      value.mapped_at = new Date();
      if (req.user) {
        value.mapped_by = req.user.id;
      }
    }

    const issue = await Issue.update(parseInt(id), value);

    res.json({
      success: true,
      message: 'Issue updated successfully',
      data: { issue }
    });
  } catch (error) {
    next(error);
  }
};

// Delete issue
const deleteIssue = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid issue ID is required'
      });
    }

    const issue = await Issue.findById(parseInt(id));
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    const deleted = await Issue.delete(parseInt(id));

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete issue'
      });
    }

    res.json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get issues assigned to current user
const getMyAssignedIssues = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const filters = {};
    if (status) filters.status = status;

    const issues = await Issue.findByAssignee(req.user.id, filters);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedIssues = issues.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        issues: paginatedIssues,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(issues.length / limit),
          count: issues.length,
          perPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get issue statistics
const getIssueStats = async (req, res, next) => {
  try {
    const { city, cluster, startDate, endDate } = req.query;

    const filters = {};
    if (city) filters.city = city;
    if (cluster) filters.cluster = cluster;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const stats = await Issue.getStats(filters);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

// Assign issue to user
const assignIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid issue ID is required'
      });
    }

    if (!assigned_to || isNaN(assigned_to)) {
      return res.status(400).json({
        success: false,
        message: 'Valid assignee ID is required'
      });
    }

    const issue = await Issue.update(parseInt(id), {
      assigned_to: parseInt(assigned_to),
      status: 'in_progress'
    });

    res.json({
      success: true,
      message: 'Issue assigned successfully',
      data: { issue }
    });
  } catch (error) {
    next(error);
  }
};

// Close issue
const closeIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolution_note } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid issue ID is required'
      });
    }

    const updates = {
      status: 'closed',
      closed_at: new Date()
    };

    if (resolution_note) {
      updates.resolution_note = resolution_note;
    }

    const issue = await Issue.update(parseInt(id), updates);

    res.json({
      success: true,
      message: 'Issue closed successfully',
      data: { issue }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  getMyAssignedIssues,
  getIssueStats,
  assignIssue,
  closeIssue
};