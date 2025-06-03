
const express = require('express');
const db = require('../config/database');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Get all issues with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      category,
      assignee,
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    let query = `
      SELECT i.*, u.name as employee_name, u.email as employee_email,
             d.name as assignee_name
      FROM issues i
      LEFT JOIN users u ON i.employee_id = u.id
      LEFT JOIN dashboard_users d ON i.assigned_to = d.id
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

    if (category) {
      query += ' AND i.category = ?';
      params.push(category);
    }

    if (assignee) {
      query += ' AND i.assigned_to = ?';
      params.push(assignee);
    }

    if (search) {
      query += ' AND (i.title LIKE ? OR i.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY i.created_at DESC';

    // Pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [issues] = await db.execute(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM issues i
      WHERE 1=1
    `;
    
    const countParams = params.slice(0, -2); // Remove LIMIT and OFFSET params
    
    if (status) countQuery += ' AND i.status = ?';
    if (priority) countQuery += ' AND i.priority = ?';
    if (category) countQuery += ' AND i.category = ?';
    if (assignee) countQuery += ' AND i.assigned_to = ?';
    if (search) countQuery += ' AND (i.title LIKE ? OR i.description LIKE ?)';

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
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

// Get single issue
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [issues] = await db.execute(`
      SELECT i.*, u.name as employee_name, u.email as employee_email,
             d.name as assignee_name
      FROM issues i
      LEFT JOIN users u ON i.employee_id = u.id
      LEFT JOIN dashboard_users d ON i.assigned_to = d.id
      WHERE i.id = ?
    `, [id]);

    if (issues.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Get comments
    const [comments] = await db.execute(`
      SELECT c.*, d.name as author_name
      FROM issue_comments c
      LEFT JOIN dashboard_users d ON c.author_id = d.id
      WHERE c.issue_id = ?
      ORDER BY c.created_at ASC
    `, [id]);

    const issue = issues[0];
    issue.comments = comments;

    res.json({ issue });

  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({ error: 'Failed to fetch issue' });
  }
});

// Create new issue
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority = 'medium',
      employee_id
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }

    const [result] = await db.execute(`
      INSERT INTO issues (title, description, category, priority, employee_id, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'open', NOW())
    `, [title, description, category, priority, employee_id]);

    res.status(201).json({
      issueId: result.insertId,
      message: 'Issue created successfully'
    });

  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

// Update issue
router.put('/:id', authenticateToken, requirePermission('manage:issues'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = ['status', 'priority', 'assigned_to', 'title', 'description'];
    const updateFields = [];
    const updateValues = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateValues.push(id);

    await db.execute(`
      UPDATE issues 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = ?
    `, updateValues);

    res.json({ message: 'Issue updated successfully' });

  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ error: 'Failed to update issue' });
  }
});

// Add comment to issue
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const [result] = await db.execute(`
      INSERT INTO issue_comments (issue_id, author_id, content, created_at)
      VALUES (?, ?, ?, NOW())
    `, [id, req.user.id, content]);

    res.status(201).json({
      commentId: result.insertId,
      message: 'Comment added successfully'
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

module.exports = router;
