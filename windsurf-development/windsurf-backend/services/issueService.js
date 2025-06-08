
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class IssueService {
  async getIssues(filters = {}, page = 1, limit = 10) {
    try {
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (filters.status) {
        whereClause += ' AND status = ?';
        params.push(filters.status);
      }

      if (filters.priority) {
        whereClause += ' AND priority = ?';
        params.push(filters.priority);
      }

      if (filters.assignedTo) {
        whereClause += ' AND assigned_to = ?';
        params.push(filters.assignedTo);
      }

      if (filters.search) {
        whereClause += ' AND (title LIKE ? OR description LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      const offset = (page - 1) * limit;

      const [issues] = await db.execute(
        `SELECT i.*, e.name as creator_name, du.name as assigned_name 
         FROM issues i 
         LEFT JOIN employees e ON i.created_by = e.id 
         LEFT JOIN dashboard_users du ON i.assigned_to = du.id 
         ${whereClause} 
         ORDER BY i.created_at DESC 
         LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), offset]
      );

      const [totalResult] = await db.execute(
        `SELECT COUNT(*) as total FROM issues ${whereClause}`,
        params
      );

      return {
        issues,
        total: totalResult[0].total
      };
    } catch (error) {
      console.error('Error fetching issues:', error);
      throw error;
    }
  }

  async getIssueById(id) {
    try {
      const [issues] = await db.execute(
        `SELECT i.*, e.name as creator_name, du.name as assigned_name 
         FROM issues i 
         LEFT JOIN employees e ON i.created_by = e.id 
         LEFT JOIN dashboard_users du ON i.assigned_to = du.id 
         WHERE i.id = ?`,
        [id]
      );

      if (issues.length === 0) return null;

      // Get comments
      const [comments] = await db.execute(
        `SELECT c.*, e.name as author_name 
         FROM comments c 
         LEFT JOIN employees e ON c.author_id = e.id 
         WHERE c.issue_id = ? 
         ORDER BY c.created_at ASC`,
        [id]
      );

      return {
        ...issues[0],
        comments
      };
    } catch (error) {
      console.error('Error fetching issue:', error);
      throw error;
    }
  }

  async createIssue(issueData) {
    try {
      const id = uuidv4();
      const {
        title,
        description,
        category,
        priority = 'medium',
        createdBy,
        city,
        cluster,
        attachments = null
      } = issueData;

      await db.execute(
        `INSERT INTO issues (id, title, description, category, priority, status, created_by, city, cluster, attachments, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, 'open', ?, ?, ?, ?, NOW(), NOW())`,
        [id, title, description, category, priority, createdBy, city, cluster, attachments]
      );

      return id;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  }

  async updateIssue(id, updateData) {
    try {
      const { status, priority, assignedTo, updatedBy } = updateData;
      
      const updates = [];
      const params = [];

      if (status) {
        updates.push('status = ?');
        params.push(status);
      }

      if (priority) {
        updates.push('priority = ?');
        params.push(priority);
      }

      if (assignedTo) {
        updates.push('assigned_to = ?');
        params.push(assignedTo);
      }

      if (updates.length === 0) return false;

      updates.push('updated_at = NOW()');
      params.push(id);

      const [result] = await db.execute(
        `UPDATE issues SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating issue:', error);
      throw error;
    }
  }

  async deleteIssue(id) {
    try {
      const [result] = await db.execute('DELETE FROM issues WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting issue:', error);
      throw error;
    }
  }

  async assignIssue(id, assignedTo, assignedBy) {
    try {
      const [result] = await db.execute(
        'UPDATE issues SET assigned_to = ?, updated_at = NOW() WHERE id = ?',
        [assignedTo, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error assigning issue:', error);
      throw error;
    }
  }
}

module.exports = new IssueService();
