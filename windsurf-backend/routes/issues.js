const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, authenticateEmployee } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get all issues with filters (Admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, typeId, priority, city, assignedTo, startDate, endDate } = req.query;
    
    let query = `
      SELECT i.*, e.employee_name, e.employee_id, e.city, e.cluster, e.manager_name,
             du.name as assigned_to_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.employee_uuid
      LEFT JOIN dashboard_users du ON i.assigned_to = du.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }
    if (typeId) {
      query += ' AND i.typeId = ?';
      params.push(typeId);
    }
    if (priority) {
      query += ' AND i.priority = ?';
      params.push(priority);
    }
    if (city) {
      query += ' AND e.city = ?';
      params.push(city);
    }
    if (assignedTo) {
      query += ' AND i.assigned_to = ?';
      params.push(assignedTo);
    }
    if (startDate) {
      query += ' AND DATE(i.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND DATE(i.created_at) <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY i.created_at DESC';

    const [issues] = await pool.execute(query, params);
    res.json({ success: true, issues });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

// Get single issue by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [issues] = await pool.execute(`
      SELECT i.*, e.employee_name, e.employee_id, e.city, e.cluster, e.manager_name,
             du.name as assigned_to_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.employee_uuid
      LEFT JOIN dashboard_users du ON i.assigned_to = du.id
      WHERE i.id = ?
    `, [id]);

    if (issues.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Get comments
    const [comments] = await pool.execute(`
      SELECT ic.*, e.employee_name as commenter_name, du.name as admin_name
      FROM issue_comments ic
      LEFT JOIN employees e ON ic.employee_uuid = e.employee_uuid
      LEFT JOIN dashboard_users du ON ic.admin_user_id = du.id
      WHERE ic.issue_id = ?
      ORDER BY ic.created_at ASC
    `, [id]);

    const issue = issues[0];
    issue.comments = comments;

    res.json({ success: true, issue });
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({ error: 'Failed to fetch issue' });
  }
});

// Create new issue (Employee)
router.post('/', authenticateEmployee, async (req, res) => {
  try {
    const { typeId, subTypeId, description, priority = 'medium' } = req.body;
    const employeeUuid = req.employee.employee_uuid;

    if (!typeId || !description) {
      return res.status(400).json({ error: 'Type and description are required' });
    }

    const issueId = uuidv4();
    
    const [result] = await pool.execute(`
      INSERT INTO issues (id, employee_uuid, typeId, subTypeId, description, priority, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'open', NOW(), NOW())
    `, [issueId, employeeUuid, typeId, subTypeId || '', description, priority]);

    // Create audit log
    await pool.execute(`
      INSERT INTO issue_audit_trail (issue_id, user_id, action, details, created_at)
      VALUES (?, ?, 'create', ?, NOW())
    `, [issueId, employeeUuid, `Issue created: ${description.substring(0, 100)}`]);

    res.status(201).json({
      success: true,
      issueId,
      message: 'Issue created successfully'
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

// Update issue status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'closed' || status === 'resolved') {
      updateData.closed_at = new Date().toISOString();
    }

    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);

    await pool.execute(`UPDATE issues SET ${setClause} WHERE id = ?`, [...values, id]);

    // Create audit log
    await pool.execute(`
      INSERT INTO issue_audit_trail (issue_id, user_id, action, details, created_at)
      VALUES (?, ?, 'status_change', ?, NOW())
    `, [id, userId, `Status changed to: ${status}`]);

    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Assign issue to user
router.patch('/:id/assign', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    const userId = req.user.id;

    await pool.execute(`
      UPDATE issues SET assigned_to = ?, updated_at = NOW() WHERE id = ?
    `, [assignedTo, id]);

    // Create audit log
    await pool.execute(`
      INSERT INTO issue_audit_trail (issue_id, user_id, action, details, created_at)
      VALUES (?, ?, 'assignment', ?, NOW())
    `, [id, userId, `Issue assigned to user ID: ${assignedTo}`]);

    res.json({ success: true, message: 'Issue assigned successfully' });
  } catch (error) {
    console.error('Error assigning issue:', error);
    res.status(500).json({ error: 'Failed to assign issue' });
  }
});

// Add comment to issue
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    await pool.execute(`
      INSERT INTO issue_comments (issue_id, admin_user_id, content, created_at)
      VALUES (?, ?, ?, NOW())
    `, [id, userId, content]);

    res.status(201).json({ success: true, message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get employee issues
router.get('/employee/my-issues', authenticateEmployee, async (req, res) => {
  try {
    const employeeUuid = req.employee.employee_uuid;
    
    const [issues] = await pool.execute(`
      SELECT i.*, e.employee_name, e.employee_id, e.city, e.cluster, e.manager_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.employee_uuid
      WHERE i.employee_uuid = ?
      ORDER BY i.created_at DESC
    `, [employeeUuid]);

    res.json({ success: true, issues });
  } catch (error) {
    console.error('Error fetching employee issues:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

module.exports = router;
