
const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

class MobileController {
  // Get employee issues
  async getEmployeeIssues(req, res) {
    try {
      const { employeeId } = req.params;
      const { status, priority, page = 1, limit = 10 } = req.query;

      let query = `
        SELECT 
          i.*,
          e.name as employee_name,
          da.name as assigned_to_name
        FROM issues i
        LEFT JOIN employees e ON i.employee_id = e.id
        LEFT JOIN dashboard_users da ON i.assigned_to = da.id
        WHERE i.employee_id = ?
      `;
      
      const params = [employeeId];

      if (status) {
        query += ' AND i.status = ?';
        params.push(status);
      }

      if (priority) {
        query += ' AND i.priority = ?';
        params.push(priority);
      }

      query += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

      const [issues] = await pool.execute(query, params);

      res.json({
        success: true,
        data: issues,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: issues.length
        }
      });
    } catch (error) {
      console.error('Get employee issues error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch issues',
        message: error.message 
      });
    }
  }

  // Get issue details with comments
  async getIssueDetails(req, res) {
    try {
      const { id } = req.params;

      // Get issue details
      const [issues] = await pool.execute(`
        SELECT 
          i.*,
          e.name as employee_name,
          e.email as employee_email,
          da.name as assigned_to_name
        FROM issues i
        LEFT JOIN employees e ON i.employee_id = e.id
        LEFT JOIN dashboard_users da ON i.assigned_to = da.id
        WHERE i.id = ?
      `, [id]);

      if (issues.length === 0) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      // Get comments
      const [comments] = await pool.execute(`
        SELECT 
          c.*,
          COALESCE(e.name, da.name, 'System') as author_name
        FROM issue_comments c
        LEFT JOIN employees e ON c.employee_id = e.id
        LEFT JOIN dashboard_users da ON c.dashboard_user_id = da.id
        WHERE c.issue_id = ?
        ORDER BY c.created_at ASC
      `, [id]);

      const issue = {
        ...issues[0],
        comments: comments
      };

      res.json({
        success: true,
        data: issue
      });
    } catch (error) {
      console.error('Get issue details error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch issue details',
        message: error.message 
      });
    }
  }

  // Create new issue
  async createIssue(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const {
        title,
        description,
        priority = 'medium',
        category,
        employee_id
      } = req.body;

      const [result] = await pool.execute(`
        INSERT INTO issues (
          title,
          description,
          priority,
          category,
          employee_id,
          status,
          created_at
        ) VALUES (?, ?, ?, ?, ?, 'open', NOW())
      `, [title, description, priority, category, employee_id]);

      res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          title,
          description,
          priority,
          category,
          employee_id,
          status: 'open'
        }
      });
    } catch (error) {
      console.error('Create issue error:', error);
      res.status(500).json({ 
        error: 'Failed to create issue',
        message: error.message 
      });
    }
  }

  // Add comment to issue
  async addComment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const {
        issue_id,
        content,
        employee_id
      } = req.body;

      const [result] = await pool.execute(`
        INSERT INTO issue_comments (
          issue_id,
          content,
          employee_id,
          created_at
        ) VALUES (?, ?, ?, NOW())
      `, [issue_id, content, employee_id]);

      // Update issue's last activity
      await pool.execute(`
        UPDATE issues 
        SET updated_at = NOW() 
        WHERE id = ?
      `, [issue_id]);

      res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          issue_id,
          content,
          employee_id
        }
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ 
        error: 'Failed to add comment',
        message: error.message 
      });
    }
  }

  // Get employee profile
  async getProfile(req, res) {
    try {
      const { employeeId } = req.params;

      const [employees] = await pool.execute(`
        SELECT 
          id,
          name,
          email,
          emp_id,
          phone,
          department,
          city,
          role,
          date_of_joining,
          created_at
        FROM employees 
        WHERE id = ?
      `, [employeeId]);

      if (employees.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json({
        success: true,
        data: employees[0]
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch profile',
        message: error.message 
      });
    }
  }

  // Update employee profile
  async updateProfile(req, res) {
    try {
      const { employeeId } = req.params;
      const updates = req.body;

      // Build dynamic update query
      const allowedFields = ['phone', 'department', 'city'];
      const updateFields = [];
      const updateValues = [];

      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          updateValues.push(updates[field]);
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      updateValues.push(employeeId);

      await pool.execute(`
        UPDATE employees 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = ?
      `, updateValues);

      res.json({
        success: true,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ 
        error: 'Failed to update profile',
        message: error.message 
      });
    }
  }

  // Get dashboard statistics for mobile
  async getDashboardStats(req, res) {
    try {
      const { employeeId } = req.query;

      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_issues,
          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_issues,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_issues,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_issues,
          SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_issues
        FROM issues 
        WHERE employee_id = ?
      `, [employeeId]);

      res.json({
        success: true,
        data: stats[0]
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch dashboard stats',
        message: error.message 
      });
    }
  }
}

module.exports = new MobileController();
