const express = require('express');
const { authenticateToken, requireRole, requirePermission } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { requirePermission: rbacRequirePermission, requireIssueAccess } = require('../middleware/rbac');
const issueService = require('../services/issueService');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/issues/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get all issues with filters
router.get('/', 
  authenticateToken, 
  rbacRequirePermission('issues:view_all'),
  async (req, res) => {
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
      console.error('Error fetching issues:', error);
      res.status(500).json({ error: 'Failed to fetch issues' });
    }
  }
);

// Get single issue
router.get('/:id', 
  authenticateToken, 
  rbacRequirePermission('issues:view_own'),
  async (req, res) => {
    try {
      const issueDetails = await issueService.getIssueDetails(
        req.params.id, 
        req.user.id, 
        req.user.role
      );
      res.json(issueDetails);
    } catch (error) {
      console.error('Error fetching issue:', error);
      if (error.message === 'Issue not found') {
        res.status(404).json({ error: 'Issue not found' });
      } else if (error.message === 'Access denied') {
        res.status(403).json({ error: 'Access denied' });
      } else {
        res.status(500).json({ error: 'Failed to fetch issue' });
      }
    }
  }
);

// Create new issue
router.post('/', 
  authenticateToken,
  rbacRequirePermission('issues:create'),
  upload.array('attachments', 5),
  validate(schemas.createIssue),
  async (req, res) => {
    try {
      const issueData = {
        ...req.validatedBody,
        attachments: req.files ? req.files.map(file => file.path) : []
      };
      
      const issueId = await issueService.createIssue(issueData, req.user.id);
      res.status(201).json({
        issueId,
        message: 'Issue created successfully'
      });
    } catch (error) {
      console.error('Error creating issue:', error);
      res.status(500).json({ error: error.message || 'Failed to create issue' });
    }
  }
);

// Update issue
router.put('/:id', 
  authenticateToken, 
  rbacRequirePermission('issues:update'),
  validate(schemas.updateIssue),
  async (req, res) => {
    try {
      if (req.validatedBody.status) {
        await issueService.updateIssueStatus(
          req.params.id, 
          req.validatedBody.status, 
          req.user.id,
          req.validatedBody.comment
        );
      }
      
      if (req.validatedBody.assigned_to) {
        await issueService.assignIssue(
          req.params.id, 
          req.validatedBody.assigned_to, 
          req.user.id
        );
      }
      
      res.json({ message: 'Issue updated successfully' });
    } catch (error) {
      console.error('Error updating issue:', error);
      res.status(500).json({ error: error.message || 'Failed to update issue' });
    }
  }
);

// Add comment to issue
router.post('/:id/comments', 
  authenticateToken,
  rbacRequirePermission('comments:create'),
  requireIssueAccess,
  validate(schemas.comment),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.validatedBody;

      // Add comment to issue
      await db.execute(`
        INSERT INTO issue_comments (id, issue_id, employee_uuid, content, created_at)
        VALUES (UUID(), ?, ?, ?, NOW())
      `, [id, req.user.id, content]);

      res.status(201).json({ message: 'Comment added successfully' });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ error: 'Failed to add comment' });
    }
  }
);

// Add internal comment (admin only)
router.post('/:id/internal-comments', 
  authenticateToken, 
  rbacRequirePermission('comments:internal'),
  validate(schemas.comment),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.validatedBody;

      // Add internal comment
      await db.execute(`
        INSERT INTO issue_internal_comments (id, issue_id, employee_uuid, content, created_at, updated_at)
        VALUES (UUID(), ?, ?, ?, NOW(), NOW())
      `, [id, req.user.id, content]);

      res.status(201).json({ message: 'Internal comment added successfully' });
    } catch (error) {
      console.error('Error adding internal comment:', error);
      res.status(500).json({ error: 'Failed to add internal comment' });
    }
  }
);

module.exports = router;
