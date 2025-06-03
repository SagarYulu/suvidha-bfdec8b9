
const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, requireRole, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const createIssueSchema = Joi.object({
  typeId: Joi.string().required(),
  subTypeId: Joi.string().required(),
  description: Joi.string().min(10).required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  attachments: Joi.array().items(Joi.string()).optional()
});

const updateIssueSchema = Joi.object({
  status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
  assignedTo: Joi.string().optional()
});

const commentSchema = Joi.object({
  content: Joi.string().min(1).required()
});

// Get all issues (with filtering)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      status,
      priority,
      assignedTo,
      employeeUuid,
      typeId,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    let whereConditions = [];
    let queryParams = [];

    // Role-based filtering
    if (req.user.role === 'employee') {
      whereConditions.push('i.employee_uuid = ?');
      queryParams.push(req.user.id);
    } else if (employeeUuid) {
      whereConditions.push('i.employee_uuid = ?');
      queryParams.push(employeeUuid);
    }

    // Additional filters
    if (status) {
      whereConditions.push('i.status = ?');
      queryParams.push(status);
    }
    if (priority) {
      whereConditions.push('i.priority = ?');
      queryParams.push(priority);
    }
    if (assignedTo) {
      whereConditions.push('i.assigned_to = ?');
      queryParams.push(assignedTo);
    }
    if (typeId) {
      whereConditions.push('i.type_id = ?');
      queryParams.push(typeId);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM issues i ${whereClause}`,
      queryParams
    );

    const total = countResult[0].total;
    const offset = (page - 1) * limit;

    // Get issues with user details
    const [issues] = await db.execute(`
      SELECT 
        i.*,
        e.name as employee_name,
        e.email as employee_email,
        au.name as assigned_user_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      LEFT JOIN dashboard_users au ON i.assigned_to = au.id
      ${whereClause}
      ORDER BY i.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    res.json({
      issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

// Get issue by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [issues] = await db.execute(`
      SELECT 
        i.*,
        e.name as employee_name,
        e.email as employee_email,
        e.phone as employee_phone,
        au.name as assigned_user_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      LEFT JOIN dashboard_users au ON i.assigned_to = au.id
      WHERE i.id = ?
    `, [id]);

    if (issues.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const issue = issues[0];

    // Role-based access control
    if (req.user.role === 'employee' && issue.employee_uuid !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get comments
    const [comments] = await db.execute(`
      SELECT 
        c.*,
        COALESCE(e.name, du.name) as commenter_name
      FROM issue_comments c
      LEFT JOIN employees e ON c.employee_uuid = e.id
      LEFT JOIN dashboard_users du ON c.employee_uuid = du.id
      WHERE c.issue_id = ?
      ORDER BY c.created_at ASC
    `, [id]);

    // Get internal comments (for admin users only)
    let internalComments = [];
    if (req.user.role !== 'employee') {
      const [internal] = await db.execute(`
        SELECT 
          ic.*,
          du.name as commenter_name
        FROM issue_internal_comments ic
        LEFT JOIN dashboard_users du ON ic.employee_uuid = du.id
        WHERE ic.issue_id = ?
        ORDER BY ic.created_at ASC
      `, [id]);
      internalComments = internal;
    }

    res.json({
      ...issue,
      comments,
      internalComments
    });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: 'Failed to fetch issue' });
  }
});

// Create new issue
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = createIssueSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { typeId, subTypeId, description, priority, attachments } = value;
    const issueId = uuidv4();

    await db.execute(`
      INSERT INTO issues (
        id, employee_uuid, type_id, sub_type_id, description, 
        priority, status, attachments, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'open', ?, NOW(), NOW())
    `, [
      issueId,
      req.user.id,
      typeId,
      subTypeId,
      description,
      priority,
      JSON.stringify(attachments || [])
    ]);

    // Log audit trail
    await db.execute(`
      INSERT INTO issue_audit_trail (
        id, issue_id, employee_uuid, action, details, created_at
      ) VALUES (?, ?, ?, 'created', ?, NOW())
    `, [
      uuidv4(),
      issueId,
      req.user.id,
      JSON.stringify({ description, priority, typeId, subTypeId })
    ]);

    res.status(201).json({ issueId, message: 'Issue created successfully' });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

// Update issue
router.put('/:id', authenticateToken, requireRole(['admin', 'security-admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateIssueSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Get current issue data
    const [currentIssue] = await db.execute('SELECT * FROM issues WHERE id = ?', [id]);
    if (currentIssue.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const updates = [];
    const params = [];
    
    Object.entries(value).forEach(([key, val]) => {
      if (val !== undefined) {
        updates.push(`${key} = ?`);
        params.push(val);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    await db.execute(
      `UPDATE issues SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Log audit trail
    await db.execute(`
      INSERT INTO issue_audit_trail (
        id, issue_id, employee_uuid, action, details, 
        previous_status, new_status, created_at
      ) VALUES (?, ?, ?, 'updated', ?, ?, ?, NOW())
    `, [
      uuidv4(),
      id,
      req.user.id,
      JSON.stringify(value),
      currentIssue[0].status,
      value.status || currentIssue[0].status
    ]);

    res.json({ message: 'Issue updated successfully' });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ error: 'Failed to update issue' });
  }
});

// Add comment to issue
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = commentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if issue exists and user has access
    const [issues] = await db.execute('SELECT employee_uuid FROM issues WHERE id = ?', [id]);
    if (issues.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (req.user.role === 'employee' && issues[0].employee_uuid !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const commentId = uuidv4();
    await db.execute(`
      INSERT INTO issue_comments (id, issue_id, employee_uuid, content, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [commentId, id, req.user.id, value.content]);

    res.status(201).json({ commentId, message: 'Comment added successfully' });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Add internal comment (admin only)
router.post('/:id/internal-comments', authenticateToken, requireRole(['admin', 'security-admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = commentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const [issues] = await db.execute('SELECT id FROM issues WHERE id = ?', [id]);
    if (issues.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const commentId = uuidv4();
    await db.execute(`
      INSERT INTO issue_internal_comments (id, issue_id, employee_uuid, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `, [commentId, id, req.user.id, value.content]);

    res.status(201).json({ commentId, message: 'Internal comment added successfully' });
  } catch (error) {
    console.error('Add internal comment error:', error);
    res.status(500).json({ error: 'Failed to add internal comment' });
  }
});

module.exports = router;
