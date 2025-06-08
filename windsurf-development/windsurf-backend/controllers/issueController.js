
const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

const issueController = {
  // Get all issues with filtering and pagination
  async getIssues(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        priority, 
        assigned_to, 
        search,
        type_id,
        employee_uuid
      } = req.query;
      
      const offset = (page - 1) * limit;

      let query = `
        SELECT i.*, 
               du.name as assigned_to_name,
               e.name as employee_name,
               e.email as employee_email
        FROM issues i
        LEFT JOIN dashboard_users du ON i.assigned_to = du.id
        LEFT JOIN employees e ON i.employee_uuid = e.id
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

      if (assigned_to) {
        query += ' AND i.assigned_to = ?';
        params.push(assigned_to);
      }

      if (type_id) {
        query += ' AND i.type_id = ?';
        params.push(type_id);
      }

      if (employee_uuid) {
        query += ' AND i.employee_uuid = ?';
        params.push(employee_uuid);
      }

      if (search) {
        query += ' AND (i.description LIKE ? OR i.title LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [issues] = await pool.execute(query, params);

      // Count total for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM issues i WHERE 1=1';
      const countParams = [];

      if (status) {
        countQuery += ' AND i.status = ?';
        countParams.push(status);
      }

      if (priority) {
        countQuery += ' AND i.priority = ?';
        countParams.push(priority);
      }

      if (assigned_to) {
        countQuery += ' AND i.assigned_to = ?';
        countParams.push(assigned_to);
      }

      if (type_id) {
        countQuery += ' AND i.type_id = ?';
        countParams.push(type_id);
      }

      if (employee_uuid) {
        countQuery += ' AND i.employee_uuid = ?';
        countParams.push(employee_uuid);
      }

      if (search) {
        countQuery += ' AND (i.description LIKE ? OR i.title LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`);
      }

      const [countResult] = await pool.execute(countQuery, countParams);
      const total = countResult[0].total;

      res.json({
        data: {
          issues,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get issues error:', error);
      res.status(500).json({ error: 'Failed to fetch issues' });
    }
  },

  // Get single issue
  async getIssue(req, res) {
    try {
      const { id } = req.params;

      const [issues] = await pool.execute(`
        SELECT i.*, 
               du.name as assigned_to_name,
               e.name as employee_name,
               e.email as employee_email,
               e.phone as employee_phone,
               e.city as employee_city,
               e.cluster as employee_cluster
        FROM issues i
        LEFT JOIN dashboard_users du ON i.assigned_to = du.id
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE i.id = ?
      `, [id]);

      if (issues.length === 0) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      // Get comments
      const [comments] = await pool.execute(`
        SELECT ic.*, 
               du.name as author_name,
               e.name as employee_name
        FROM issue_comments ic
        LEFT JOIN dashboard_users du ON ic.author_id = du.id
        LEFT JOIN employees e ON ic.employee_uuid = e.id
        WHERE ic.issue_id = ?
        ORDER BY ic.created_at ASC
      `, [id]);

      // Get audit trail
      const [auditTrail] = await pool.execute(`
        SELECT * FROM issue_audit_trail 
        WHERE issue_id = ? 
        ORDER BY created_at DESC
      `, [id]);

      res.json({
        data: {
          issue: issues[0],
          comments,
          auditTrail
        }
      });
    } catch (error) {
      console.error('Get issue error:', error);
      res.status(500).json({ error: 'Failed to fetch issue' });
    }
  },

  // Create new issue
  async createIssue(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { 
        typeId, 
        subTypeId, 
        title, 
        description, 
        priority = 'medium',
        employeeUuid,
        attachments 
      } = req.body;

      const [result] = await pool.execute(`
        INSERT INTO issues 
        (employee_uuid, type_id, sub_type_id, title, description, priority, attachments, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'open')
      `, [employeeUuid, typeId, subTypeId, title, description, priority, JSON.stringify(attachments || [])]);

      // Log audit trail
      await pool.execute(`
        INSERT INTO issue_audit_trail 
        (issue_id, employee_uuid, action, details) 
        VALUES (?, ?, 'created', ?)
      `, [result.insertId, employeeUuid, JSON.stringify({ typeId, subTypeId, priority })]);

      res.status(201).json({
        data: {
          id: result.insertId,
          message: 'Issue created successfully'
        }
      });
    } catch (error) {
      console.error('Create issue error:', error);
      res.status(500).json({ error: 'Failed to create issue' });
    }
  },

  // Update issue
  async updateIssue(req, res) {
    try {
      const { id } = req.params;
      const { status, priority, assigned_to, mapped_type_id, mapped_sub_type_id } = req.body;

      // Check if issue exists
      const [existingIssues] = await pool.execute(
        'SELECT * FROM issues WHERE id = ?',
        [id]
      );

      if (existingIssues.length === 0) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      const existingIssue = existingIssues[0];
      const updateData = {};
      const updateFields = [];
      const updateValues = [];

      if (status !== undefined && status !== existingIssue.status) {
        updateFields.push('status = ?');
        updateValues.push(status);
        updateData.status = { from: existingIssue.status, to: status };

        if (status === 'closed') {
          updateFields.push('closed_at = NOW()');
        }
      }

      if (priority !== undefined && priority !== existingIssue.priority) {
        updateFields.push('priority = ?');
        updateValues.push(priority);
        updateData.priority = { from: existingIssue.priority, to: priority };
      }

      if (assigned_to !== undefined && assigned_to !== existingIssue.assigned_to) {
        updateFields.push('assigned_to = ?');
        updateValues.push(assigned_to);
        updateData.assigned_to = { from: existingIssue.assigned_to, to: assigned_to };
      }

      if (mapped_type_id !== undefined) {
        updateFields.push('mapped_type_id = ?, mapped_by = ?, mapped_at = NOW()');
        updateValues.push(mapped_type_id, req.user.id);
        updateData.mapped_type_id = { from: existingIssue.mapped_type_id, to: mapped_type_id };
      }

      if (mapped_sub_type_id !== undefined) {
        updateFields.push('mapped_sub_type_id = ?');
        updateValues.push(mapped_sub_type_id);
        updateData.mapped_sub_type_id = { from: existingIssue.mapped_sub_type_id, to: mapped_sub_type_id };
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      updateValues.push(id);

      await pool.execute(
        `UPDATE issues SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      // Log audit trail
      await pool.execute(`
        INSERT INTO issue_audit_trail 
        (issue_id, employee_uuid, action, details, previous_status, new_status) 
        VALUES (?, ?, 'updated', ?, ?, ?)
      `, [
        id, 
        existingIssue.employee_uuid, 
        'updated', 
        JSON.stringify(updateData),
        existingIssue.status,
        status || existingIssue.status
      ]);

      res.json({ message: 'Issue updated successfully' });
    } catch (error) {
      console.error('Update issue error:', error);
      res.status(500).json({ error: 'Failed to update issue' });
    }
  },

  // Assign issue
  async assignIssue(req, res) {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;

      // Check if issue exists
      const [existingIssues] = await pool.execute(
        'SELECT * FROM issues WHERE id = ?',
        [id]
      );

      if (existingIssues.length === 0) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      const existingIssue = existingIssues[0];

      await pool.execute(
        'UPDATE issues SET assigned_to = ? WHERE id = ?',
        [assignedTo, id]
      );

      // Log audit trail
      await pool.execute(`
        INSERT INTO issue_audit_trail 
        (issue_id, employee_uuid, action, details) 
        VALUES (?, ?, 'assigned', ?)
      `, [
        id, 
        req.user.id, 
        JSON.stringify({ 
          from: existingIssue.assigned_to, 
          to: assignedTo 
        })
      ]);

      res.json({ message: 'Issue assigned successfully' });
    } catch (error) {
      console.error('Assign issue error:', error);
      res.status(500).json({ error: 'Failed to assign issue' });
    }
  },

  // Add comment
  async addComment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { content } = req.body;

      // Check if issue exists
      const [existingIssues] = await pool.execute(
        'SELECT employee_uuid FROM issues WHERE id = ?',
        [id]
      );

      if (existingIssues.length === 0) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      const [result] = await pool.execute(`
        INSERT INTO issue_comments 
        (issue_id, author_id, employee_uuid, content) 
        VALUES (?, ?, ?, ?)
      `, [id, req.user.id, req.user.id, content]);

      // Log audit trail
      await pool.execute(`
        INSERT INTO issue_audit_trail 
        (issue_id, employee_uuid, action, details) 
        VALUES (?, ?, 'comment_added', ?)
      `, [id, req.user.id, JSON.stringify({ comment_id: result.insertId })]);

      res.status(201).json({
        data: {
          id: result.insertId,
          message: 'Comment added successfully'
        }
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ error: 'Failed to add comment' });
    }
  },

  // Add internal comment
  async addInternalComment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { content } = req.body;

      // Check if issue exists
      const [existingIssues] = await pool.execute(
        'SELECT employee_uuid FROM issues WHERE id = ?',
        [id]
      );

      if (existingIssues.length === 0) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      const [result] = await pool.execute(`
        INSERT INTO issue_internal_comments 
        (issue_id, author_id, employee_uuid, content) 
        VALUES (?, ?, ?, ?)
      `, [id, req.user.id, req.user.id, content]);

      // Log audit trail
      await pool.execute(`
        INSERT INTO issue_audit_trail 
        (issue_id, employee_uuid, action, details) 
        VALUES (?, ?, 'internal_comment_added', ?)
      `, [id, req.user.id, JSON.stringify({ comment_id: result.insertId, is_internal: true })]);

      res.status(201).json({
        data: {
          id: result.insertId,
          message: 'Internal comment added successfully'
        }
      });
    } catch (error) {
      console.error('Add internal comment error:', error);
      res.status(500).json({ error: 'Failed to add internal comment' });
    }
  }
};

module.exports = issueController;
