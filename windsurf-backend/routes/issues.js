
const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get all issues with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, priority, assignedTo, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT i.*, e.name as employee_name, e.email as employee_email,
             a.name as assigned_to_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      LEFT JOIN employees a ON i.assigned_to = a.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND i.priority = ?';
      params.push(priority);
    }

    if (assignedTo) {
      query += ' AND i.assigned_to = ?';
      params.push(assignedTo);
    }

    if (search) {
      query += ' AND (i.description LIKE ? OR e.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [issues] = await db.execute(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM issues i LEFT JOIN employees e ON i.employee_uuid = e.id WHERE 1=1';
    const countParams = params.slice(0, -2); // Remove limit and offset
    
    if (status) countQuery += ' AND i.status = ?';
    if (priority) countQuery += ' AND i.priority = ?';
    if (assignedTo) countQuery += ' AND i.assigned_to = ?';
    if (search) countQuery += ' AND (i.description LIKE ? OR e.name LIKE ?)';

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

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
    console.error('Error fetching issues:', error);
    res.status(500).json({ message: 'Error fetching issues' });
  }
});

// Get single issue
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [issues] = await db.execute(
      `SELECT i.*, e.name as employee_name, e.email as employee_email,
              a.name as assigned_to_name
       FROM issues i
       LEFT JOIN employees e ON i.employee_uuid = e.id
       LEFT JOIN employees a ON i.assigned_to = a.id
       WHERE i.id = ?`,
      [req.params.id]
    );

    if (issues.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Get comments
    const [comments] = await db.execute(
      `SELECT c.*, e.name as employee_name
       FROM issue_comments c
       LEFT JOIN employees e ON c.employee_uuid = e.id
       WHERE c.issue_id = ?
       ORDER BY c.created_at ASC`,
      [req.params.id]
    );

    res.json({
      issue: issues[0],
      comments
    });
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({ message: 'Error fetching issue' });
  }
});

// Create new issue
router.post('/', [
  authenticateToken,
  body('description').isLength({ min: 1 }),
  body('type_id').isLength({ min: 1 }),
  body('sub_type_id').isLength({ min: 1 }),
  body('priority').isIn(['low', 'medium', 'high', 'critical'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { description, type_id, sub_type_id, priority } = req.body;
    const issueId = uuidv4();

    await db.execute(
      `INSERT INTO issues (id, employee_uuid, description, type_id, sub_type_id, priority, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'open', NOW(), NOW())`,
      [issueId, req.user.id, description, type_id, sub_type_id, priority]
    );

    res.status(201).json({
      message: 'Issue created successfully',
      issueId
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ message: 'Error creating issue' });
  }
});

// Update issue status
router.patch('/:id/status', [
  authenticateToken,
  body('status').isIn(['open', 'in_progress', 'resolved', 'closed'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const updateData = { status, updated_at: new Date() };

    if (status === 'closed' || status === 'resolved') {
      updateData.closed_at = new Date();
    }

    await db.execute(
      'UPDATE issues SET status = ?, updated_at = ?, closed_at = ? WHERE id = ?',
      [status, updateData.updated_at, updateData.closed_at || null, req.params.id]
    );

    res.json({ message: 'Issue status updated successfully' });
  } catch (error) {
    console.error('Error updating issue status:', error);
    res.status(500).json({ message: 'Error updating issue status' });
  }
});

// Assign issue
router.patch('/:id/assign', [
  authenticateToken,
  body('assignedTo').isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { assignedTo } = req.body;

    await db.execute(
      'UPDATE issues SET assigned_to = ?, updated_at = NOW() WHERE id = ?',
      [assignedTo, req.params.id]
    );

    res.json({ message: 'Issue assigned successfully' });
  } catch (error) {
    console.error('Error assigning issue:', error);
    res.status(500).json({ message: 'Error assigning issue' });
  }
});

// Add comment to issue
router.post('/:id/comments', [
  authenticateToken,
  body('content').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;

    await db.execute(
      'INSERT INTO issue_comments (id, issue_id, employee_uuid, content, created_at) VALUES (?, ?, ?, ?, NOW())',
      [uuidv4(), req.params.id, req.user.id, content]
    );

    res.status(201).json({ message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

module.exports = router;
