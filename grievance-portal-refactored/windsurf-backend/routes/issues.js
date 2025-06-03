
const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const createIssueSchema = Joi.object({
  type_id: Joi.string().required(),
  sub_type_id: Joi.string().required(),
  description: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  attachments: Joi.array().items(Joi.string()).optional()
});

const updateIssueSchema = Joi.object({
  status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  assigned_to: Joi.string().optional(),
  mapped_type_id: Joi.string().optional(),
  mapped_sub_type_id: Joi.string().optional()
});

const commentSchema = Joi.object({
  content: Joi.string().required()
});

// Get all issues with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      assigned_to, 
      employee_uuid,
      page = 1, 
      limit = 20,
      search,
      start_date,
      end_date
    } = req.query;

    let whereConditions = [];
    let queryParams = [];

    // Role-based filtering
    if (req.user.role === 'employee') {
      whereConditions.push('i.employee_uuid = ?');
      queryParams.push(req.user.id);
    }

    // Add filters
    if (status) {
      whereConditions.push('i.status = ?');
      queryParams.push(status);
    }

    if (priority) {
      whereConditions.push('i.priority = ?');
      queryParams.push(priority);
    }

    if (assigned_to) {
      whereConditions.push('i.assigned_to = ?');
      queryParams.push(assigned_to);
    }

    if (employee_uuid && req.user.role !== 'employee') {
      whereConditions.push('i.employee_uuid = ?');
      queryParams.push(employee_uuid);
    }

    if (search) {
      whereConditions.push('(i.description LIKE ? OR i.id LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (start_date) {
      whereConditions.push('i.created_at >= ?');
      queryParams.push(start_date);
    }

    if (end_date) {
      whereConditions.push('i.created_at <= ?');
      queryParams.push(end_date + ' 23:59:59');
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Get total count
    const [countResult] = await db.execute(`
      SELECT COUNT(*) as total
      FROM issues i
      ${whereClause}
    `, queryParams);

    const totalCount = countResult[0].total;
    const totalPages = Math.ceil(totalCount / limit);
    const offset = (page - 1) * limit;

    // Get issues with pagination
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
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), parseInt(offset)]);

    res.json({
      issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: totalPages
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

    // Check access permissions
    if (req.user.role === 'employee' && issue.employee_uuid !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get comments
    const [comments] = await db.execute(`
      SELECT 
        c.*,
        e.name as employee_name
      FROM issue_comments c
      LEFT JOIN employees e ON c.employee_uuid = e.id
      WHERE c.issue_id = ?
      ORDER BY c.created_at ASC
    `, [id]);

    // Get internal comments (only for admin/agent roles)
    let internalComments = [];
    if (req.user.role !== 'employee') {
      const [internal] = await db.execute(`
        SELECT 
          ic.*,
          du.name as user_name
        FROM issue_internal_comments ic
        LEFT JOIN dashboard_users du ON ic.employee_uuid = du.id
        WHERE ic.issue_id = ?
        ORDER BY ic.created_at ASC
      `, [id]);
      internalComments = internal;
    }

    // Get audit trail
    const [auditTrail] = await db.execute(`
      SELECT 
        at.*,
        e.name as employee_name
      FROM issue_audit_trail at
      LEFT JOIN employees e ON at.employee_uuid = e.id
      WHERE at.issue_id = ?
      ORDER BY at.created_at DESC
    `, [id]);

    res.json({
      issue,
      comments,
      internalComments,
      auditTrail
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

    const { type_id, sub_type_id, description, priority, attachments } = value;
    const issueId = uuidv4();

    await db.execute(`
      INSERT INTO issues (
        id, employee_uuid, type_id, sub_type_id, description, priority, 
        status, attachments, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'open', ?, NOW(), NOW())
    `, [issueId, req.user.id, type_id, sub_type_id, description, priority, JSON.stringify(attachments || [])]);

    // Log audit trail
    await db.execute(`
      INSERT INTO issue_audit_trail (
        id, issue_id, employee_uuid, action, details, created_at
      ) VALUES (?, ?, ?, 'issue_created', ?, NOW())
    `, [uuidv4(), issueId, req.user.id, JSON.stringify({ priority, type_id, sub_type_id })]);

    res.status(201).json({ issueId, message: 'Issue created successfully' });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

// Update issue
router.put('/:id', authenticateToken, requireRole(['admin', 'agent']), async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateIssueSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Get current issue for audit trail
    const [currentIssue] = await db.execute('SELECT * FROM issues WHERE id = ?', [id]);
    if (currentIssue.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const updateFields = [];
    const updateValues = [];
    const changes = {};

    Object.keys(value).forEach(key => {
      if (value[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value[key]);
        changes[key] = { from: currentIssue[0][key], to: value[key] };
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateFields.push('updated_at = NOW()');
    if (value.status === 'closed') {
      updateFields.push('closed_at = NOW()');
    }

    updateValues.push(id);

    await db.execute(`
      UPDATE issues 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    // Log audit trail
    let action = 'issue_updated';
    if (value.status && value.status !== currentIssue[0].status) {
      action = 'status_changed';
    } else if (value.assigned_to && value.assigned_to !== currentIssue[0].assigned_to) {
      action = 'issue_assigned';
    }

    await db.execute(`
      INSERT INTO issue_audit_trail (
        id, issue_id, employee_uuid, action, previous_status, new_status, details, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      uuidv4(), 
      id, 
      req.user.id, 
      action,
      currentIssue[0].status,
      value.status || currentIssue[0].status,
      JSON.stringify(changes)
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

    const { content } = value;

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
    `, [commentId, id, req.user.id, content]);

    // Log audit trail
    await db.execute(`
      INSERT INTO issue_audit_trail (
        id, issue_id, employee_uuid, action, details, created_at
      ) VALUES (?, ?, ?, 'comment_added', ?, NOW())
    `, [uuidv4(), id, req.user.id, JSON.stringify({ comment_id: commentId })]);

    res.status(201).json({ commentId, message: 'Comment added successfully' });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Add internal comment (admin/agent only)
router.post('/:id/internal-comments', authenticateToken, requireRole(['admin', 'agent']), async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = commentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { content } = value;

    // Check if issue exists
    const [issues] = await db.execute('SELECT id FROM issues WHERE id = ?', [id]);
    if (issues.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const commentId = uuidv4();
    await db.execute(`
      INSERT INTO issue_internal_comments (id, issue_id, employee_uuid, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `, [commentId, id, req.user.id, content]);

    res.status(201).json({ commentId, message: 'Internal comment added successfully' });
  } catch (error) {
    console.error('Add internal comment error:', error);
    res.status(500).json({ error: 'Failed to add internal comment' });
  }
});

module.exports = router;
