
const { pool } = require('../config/database');
const tatService = require('./actualTatService');
const emailService = require('./actualEmailService');
const realTimeService = require('./realTimeService');

class IssueService {
  async getIssues(filters = {}, pagination = { page: 1, limit: 10 }) {
    try {
      const { status, priority, assignedTo, city, cluster } = filters;
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;
      
      let query = `
        SELECT i.*, 
               e.name as employee_name,
               e.email as employee_email,
               e.city,
               e.cluster,
               a.name as assignee_name
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
      
      if (city) {
        query += ' AND e.city = ?';
        params.push(city);
      }
      
      if (cluster) {
        query += ' AND e.cluster = ?';
        params.push(cluster);
      }
      
      // Count total records
      const countQuery = query.replace('SELECT i.*, e.name as employee_name, e.email as employee_email, e.city, e.cluster, a.name as assignee_name', 'SELECT COUNT(*) as total');
      const [countResult] = await pool.execute(countQuery, params);
      const total = countResult[0].total;
      
      // Add pagination
      query += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const [issues] = await pool.execute(query, params);
      
      return {
        issues,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching issues:', error);
      throw error;
    }
  }

  async getIssueById(id) {
    try {
      const query = `
        SELECT i.*, 
               e.name as employee_name,
               e.email as employee_email,
               e.city,
               e.cluster,
               a.name as assignee_name
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        LEFT JOIN employees a ON i.assigned_to = a.id
        WHERE i.id = ?
      `;
      
      const [results] = await pool.execute(query, [id]);
      
      if (results.length === 0) {
        return null;
      }
      
      const issue = results[0];
      
      // Get comments
      const commentsQuery = `
        SELECT c.*, e.name as commenter_name
        FROM issue_comments c
        LEFT JOIN employees e ON c.employee_uuid = e.id
        WHERE c.issue_id = ?
        ORDER BY c.created_at ASC
      `;
      
      const [comments] = await pool.execute(commentsQuery, [id]);
      issue.comments = comments;
      
      return issue;
    } catch (error) {
      console.error('Error fetching issue by ID:', error);
      throw error;
    }
  }

  async createIssue(issueData) {
    try {
      const {
        employee_uuid,
        type_id,
        sub_type_id,
        description,
        priority = 'medium',
        status = 'open',
        attachments = null
      } = issueData;
      
      const id = require('uuid').v4();
      
      const query = `
        INSERT INTO issues (
          id, employee_uuid, type_id, sub_type_id, description, 
          priority, status, attachments, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      await pool.execute(query, [
        id, employee_uuid, type_id, sub_type_id, description,
        priority, status, JSON.stringify(attachments)
      ]);
      
      // Log audit trail
      await this.logAuditTrail(id, employee_uuid, 'created', null, status);
      
      return this.getIssueById(id);
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  }

  async updateIssue(id, updateData) {
    try {
      const currentIssue = await this.getIssueById(id);
      if (!currentIssue) {
        throw new Error('Issue not found');
      }
      
      const fields = [];
      const values = [];
      
      // Build dynamic update query
      Object.keys(updateData).forEach(key => {
        if (key !== 'updated_by' && updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });
      
      if (fields.length === 0) {
        return currentIssue;
      }
      
      fields.push('updated_at = NOW()');
      values.push(id);
      
      const query = `UPDATE issues SET ${fields.join(', ')} WHERE id = ?`;
      await pool.execute(query, values);
      
      // Log audit trail
      if (updateData.status && updateData.status !== currentIssue.status) {
        await this.logAuditTrail(id, updateData.updated_by, 'status_changed', currentIssue.status, updateData.status);
      }
      
      return this.getIssueById(id);
    } catch (error) {
      console.error('Error updating issue:', error);
      throw error;
    }
  }

  async assignIssue(id, assignedTo, assignedBy) {
    try {
      const query = 'UPDATE issues SET assigned_to = ?, updated_at = NOW() WHERE id = ?';
      await pool.execute(query, [assignedTo, id]);
      
      // Log audit trail
      await this.logAuditTrail(id, assignedBy, 'assigned', null, null, { assigned_to: assignedTo });
      
      return this.getIssueById(id);
    } catch (error) {
      console.error('Error assigning issue:', error);
      throw error;
    }
  }

  async addComment(issueId, commentData) {
    try {
      const { content, employee_uuid, is_internal = false } = commentData;
      const commentId = require('uuid').v4();
      
      const table = is_internal ? 'issue_internal_comments' : 'issue_comments';
      const query = `
        INSERT INTO ${table} (id, issue_id, employee_uuid, content, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `;
      
      await pool.execute(query, [commentId, issueId, employee_uuid, content]);
      
      // Log audit trail
      await this.logAuditTrail(issueId, employee_uuid, is_internal ? 'internal_comment_added' : 'comment_added');
      
      // Get the created comment with user details
      const getCommentQuery = `
        SELECT c.*, e.name as commenter_name
        FROM ${table} c
        LEFT JOIN employees e ON c.employee_uuid = e.id
        WHERE c.id = ?
      `;
      
      const [results] = await pool.execute(getCommentQuery, [commentId]);
      return results[0];
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const query = 'SELECT * FROM employees WHERE id = ?';
      const [results] = await pool.execute(query, [id]);
      return results[0] || null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  async getAuditTrail(issueId) {
    try {
      const query = `
        SELECT a.*, e.name as performed_by_name
        FROM issue_audit_trail a
        LEFT JOIN employees e ON a.employee_uuid = e.id
        WHERE a.issue_id = ?
        ORDER BY a.created_at DESC
      `;
      
      const [results] = await pool.execute(query, [issueId]);
      return results;
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      throw error;
    }
  }

  async logAuditTrail(issueId, employeeUuid, action, previousStatus = null, newStatus = null, details = null) {
    try {
      const id = require('uuid').v4();
      
      const query = `
        INSERT INTO issue_audit_trail (
          id, issue_id, employee_uuid, action, previous_status, new_status, details, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      await pool.execute(query, [
        id, issueId, employeeUuid, action, previousStatus, newStatus, 
        details ? JSON.stringify(details) : null
      ]);
    } catch (error) {
      console.error('Error logging audit trail:', error);
      // Don't throw here as this is a logging operation
    }
  }
}

module.exports = new IssueService();
