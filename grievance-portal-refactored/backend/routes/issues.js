
const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, authorizeRoles, checkIssueAccess } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  }
});

// Get all issues (with filtering)
router.get('/', authenticateToken, (req, res) => {
  try {
    const { status, priority, typeId, city, assignedTo, startDate, endDate } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT 
        i.*,
        e.name as employee_name,
        e.emp_id as employee_id,
        e.city,
        e.cluster,
        e.manager as manager_name,
        du.name as assigned_to_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      LEFT JOIN dashboard_users du ON i.assigned_to = du.id
      WHERE 1=1
    `;
    
    const params = [];

    // Role-based filtering
    if (userRole === 'employee') {
      query += ' AND i.employee_uuid = ?';
      params.push(userId);
    }

    // Apply filters
    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND i.priority = ?';
      params.push(priority);
    }

    if (typeId) {
      query += ' AND i.type_id = ?';
      params.push(typeId);
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

    db.query(query, params, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        success: true,
        issues: results
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single issue
router.get('/:id', authenticateToken, checkIssueAccess, (req, res) => {
  try {
    const issueId = req.params.id;

    const query = `
      SELECT 
        i.*,
        e.name as employee_name,
        e.emp_id as employee_id,
        e.email as employee_email,
        e.phone as employee_phone,
        e.city,
        e.cluster,
        e.manager as manager_name,
        du.name as assigned_to_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      LEFT JOIN dashboard_users du ON i.assigned_to = du.id
      WHERE i.id = ?
    `;

    db.query(query, [issueId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      const issue = results[0];

      // Get comments for this issue
      const commentsQuery = `
        SELECT 
          ic.*,
          e.name as commenter_name,
          du.name as admin_name
        FROM issue_comments ic
        LEFT JOIN employees e ON ic.employee_uuid = e.id
        LEFT JOIN dashboard_users du ON ic.admin_user_id = du.id
        WHERE ic.issue_id = ?
        ORDER BY ic.created_at ASC
      `;

      db.query(commentsQuery, [issueId], (err, comments) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        issue.comments = comments;

        res.json({
          success: true,
          issue
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new issue
router.post('/', authenticateToken, upload.single('attachment'), [
  body('typeId').notEmpty(),
  body('subTypeId').notEmpty(),
  body('description').notEmpty().isLength({ min: 10 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { typeId, subTypeId, description, priority = 'medium' } = req.body;
    const employeeUuid = req.user.id;
    const issueId = uuidv4();
    
    let attachmentUrl = null;
    if (req.file) {
      attachmentUrl = `/uploads/${req.file.filename}`;
    }

    const insertQuery = `
      INSERT INTO issues (id, employee_uuid, type_id, sub_type_id, description, status, priority, attachment_url)
      VALUES (?, ?, ?, ?, ?, 'open', ?, ?)
    `;

    db.query(insertQuery, [issueId, employeeUuid, typeId, subTypeId, description, priority, attachmentUrl], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to create issue' });
      }

      res.status(201).json({
        success: true,
        issueId,
        message: 'Issue created successfully'
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update issue status
router.patch('/:id/status', authenticateToken, authorizeRoles('admin', 'support'), [
  body('status').isIn(['open', 'in_progress', 'resolved', 'closed'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const issueId = req.params.id;
    const { status } = req.body;
    const closedAt = ['closed', 'resolved'].includes(status) ? new Date() : null;

    const updateQuery = `
      UPDATE issues 
      SET status = ?, closed_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.query(updateQuery, [status, closedAt, issueId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      res.json({
        success: true,
        message: 'Issue status updated successfully'
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Assign issue
router.patch('/:id/assign', authenticateToken, authorizeRoles('admin', 'support'), [
  body('assignedTo').notEmpty()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const issueId = req.params.id;
    const { assignedTo } = req.body;

    const updateQuery = `
      UPDATE issues 
      SET assigned_to = ?, status = 'in_progress', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.query(updateQuery, [assignedTo, issueId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      res.json({
        success: true,
        message: 'Issue assigned successfully'
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add comment to issue
router.post('/:id/comments', authenticateToken, [
  body('content').notEmpty().isLength({ min: 1 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const issueId = req.params.id;
    const { content } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Determine if it's an employee or admin comment
    const isEmployee = userRole === 'employee';
    const employeeUuid = isEmployee ? userId : null;
    const adminUserId = isEmployee ? null : userId;

    const insertQuery = `
      INSERT INTO issue_comments (issue_id, employee_uuid, admin_user_id, content)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertQuery, [issueId, employeeUuid, adminUserId, content], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to add comment' });
      }

      res.status(201).json({
        success: true,
        message: 'Comment added successfully'
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get employee's issues
router.get('/employee/my-issues', authenticateToken, (req, res) => {
  try {
    const employeeUuid = req.user.id;

    const query = `
      SELECT 
        i.*,
        e.name as employee_name,
        e.emp_id as employee_id,
        du.name as assigned_to_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      LEFT JOIN dashboard_users du ON i.assigned_to = du.id
      WHERE i.employee_uuid = ?
      ORDER BY i.created_at DESC
    `;

    db.query(query, [employeeUuid], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        success: true,
        issues: results
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
