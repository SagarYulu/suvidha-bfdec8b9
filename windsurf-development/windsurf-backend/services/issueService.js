
const db = require('../config/database');

class IssueService {
  async getIssues(filters = {}, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (filters.status) {
        whereClause += ' AND i.status = ?';
        params.push(filters.status);
      }

      if (filters.priority) {
        whereClause += ' AND i.priority = ?';
        params.push(filters.priority);
      }

      if (filters.assignedTo) {
        whereClause += ' AND i.assigned_to = ?';
        params.push(filters.assignedTo);
      }

      const query = `
        SELECT 
          i.*,
          creator.name as creator_name,
          assignee.name as assignee_name
        FROM issues i
        LEFT JOIN employees creator ON i.created_by = creator.uuid
        LEFT JOIN employees assignee ON i.assigned_to = assignee.uuid
        ${whereClause}
        ORDER BY i.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM issues i
        ${whereClause}
      `;

      const [issues] = await db.execute(query, [...params, limit, offset]);
      const [countResult] = await db.execute(countQuery, params);

      return {
        issues,
        total: countResult[0].total
      };
    } catch (error) {
      console.error('Error fetching issues:', error);
      throw error;
    }
  }

  async getIssueById(id) {
    try {
      const query = `
        SELECT 
          i.*,
          creator.name as creator_name,
          assignee.name as assignee_name
        FROM issues i
        LEFT JOIN employees creator ON i.created_by = creator.uuid
        LEFT JOIN employees assignee ON i.assigned_to = assignee.uuid
        WHERE i.id = ?
      `;

      const [rows] = await db.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching issue:', error);
      throw error;
    }
  }

  async createIssue(issueData) {
    try {
      const {
        title,
        description,
        category,
        priority = 'medium',
        status = 'open',
        createdBy
      } = issueData;

      const query = `
        INSERT INTO issues (
          title, description, category, priority, status, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;

      const [result] = await db.execute(query, [
        title, description, category, priority, status, createdBy
      ]);

      // Log audit trail
      await this.logAuditTrail(result.insertId, 'created', createdBy);

      return result.insertId;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  }

  async updateIssue(id, updateData) {
    try {
      const { updatedBy, ...data } = updateData;
      const fields = Object.keys(data);
      const values = Object.values(data);

      if (fields.length === 0) {
        return false;
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const query = `
        UPDATE issues 
        SET ${setClause}, updated_at = NOW()
        WHERE id = ?
      `;

      const [result] = await db.execute(query, [...values, id]);

      if (result.affectedRows > 0) {
        // Log audit trail
        await this.logAuditTrail(id, 'updated', updatedBy, data);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error updating issue:', error);
      throw error;
    }
  }

  async deleteIssue(id) {
    try {
      const query = 'DELETE FROM issues WHERE id = ?';
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting issue:', error);
      throw error;
    }
  }

  async assignIssue(issueId, assignedTo, assignedBy) {
    try {
      const query = `
        UPDATE issues 
        SET assigned_to = ?, updated_at = NOW()
        WHERE id = ?
      `;

      const [result] = await db.execute(query, [assignedTo, issueId]);

      if (result.affectedRows > 0) {
        // Log audit trail
        await this.logAuditTrail(issueId, 'assigned', assignedBy, { assigned_to: assignedTo });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error assigning issue:', error);
      throw error;
    }
  }

  async logAuditTrail(issueId, action, performedBy, changes = null) {
    try {
      const query = `
        INSERT INTO issue_audit_trail (
          issue_id, action, performed_by, changes, created_at
        ) VALUES (?, ?, ?, ?, NOW())
      `;

      await db.execute(query, [
        issueId,
        action,
        performedBy,
        changes ? JSON.stringify(changes) : null
      ]);
    } catch (error) {
      console.error('Error logging audit trail:', error);
      // Don't throw error for audit trail failures
    }
  }
}

module.exports = new IssueService();
