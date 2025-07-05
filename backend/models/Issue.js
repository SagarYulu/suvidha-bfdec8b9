const { pool } = require('../config/db');

class Issue {
  // Create a new issue
  static async create(issueData) {
    const client = await pool.connect();
    try {
      const {
        description, status = 'open', priority = 'medium', type_id, sub_type_id,
        employee_id, assigned_to, attachment_url, attachments
      } = issueData;

      const result = await client.query(
        `INSERT INTO issues (
          description, status, priority, type_id, sub_type_id, employee_id,
          assigned_to, attachment_url, attachments
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          description, status, priority, type_id, sub_type_id, employee_id,
          assigned_to, attachment_url, JSON.stringify(attachments)
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Find issue by ID
  static async findById(id) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT i.*, e.name as employee_name, e.email as employee_email,
                da.name as assigned_to_name
         FROM issues i 
         LEFT JOIN employees e ON i.employee_id = e.id
         LEFT JOIN dashboard_users da ON i.assigned_to = da.id
         WHERE i.id = $1`,
        [id]
      );
      
      if (result.rows[0] && result.rows[0].attachments) {
        result.rows[0].attachments = JSON.parse(result.rows[0].attachments);
      }
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding issue by ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get all issues with optional filters
  static async findAll(filters = {}) {
    const client = await pool.connect();
    try {
      let query = `
        SELECT i.*, e.name as employee_name, e.email as employee_email, e.city, e.cluster,
               da.name as assigned_to_name
        FROM issues i 
        LEFT JOIN employees e ON i.employee_id = e.id
        LEFT JOIN dashboard_users da ON i.assigned_to = da.id
        WHERE 1=1
      `;
      
      const values = [];
      let paramCount = 1;
      
      if (filters.status) {
        query += ` AND i.status = $${paramCount}`;
        values.push(filters.status);
        paramCount++;
      }
      
      if (filters.priority) {
        query += ` AND i.priority = $${paramCount}`;
        values.push(filters.priority);
        paramCount++;
      }
      
      if (filters.assigned_to) {
        query += ` AND i.assigned_to = $${paramCount}`;
        values.push(filters.assigned_to);
        paramCount++;
      }
      
      if (filters.employee_id) {
        query += ` AND i.employee_id = $${paramCount}`;
        values.push(filters.employee_id);
        paramCount++;
      }
      
      if (filters.city) {
        query += ` AND e.city = $${paramCount}`;
        values.push(filters.city);
        paramCount++;
      }
      
      if (filters.cluster) {
        query += ` AND e.cluster = $${paramCount}`;
        values.push(filters.cluster);
        paramCount++;
      }
      
      if (filters.type_id) {
        query += ` AND i.type_id = $${paramCount}`;
        values.push(filters.type_id);
        paramCount++;
      }
      
      if (filters.startDate) {
        query += ` AND i.created_at >= $${paramCount}`;
        values.push(filters.startDate);
        paramCount++;
      }
      
      if (filters.endDate) {
        query += ` AND i.created_at <= $${paramCount}`;
        values.push(filters.endDate);
        paramCount++;
      }
      
      if (filters.search) {
        query += ` AND (i.description ILIKE $${paramCount} OR e.name ILIKE $${paramCount} OR e.email ILIKE $${paramCount})`;
        const searchTerm = `%${filters.search}%`;
        values.push(searchTerm, searchTerm, searchTerm);
        paramCount += 3;
      }
      
      query += ' ORDER BY i.created_at DESC';
      
      const result = await client.query(query, values);
      
      // Parse JSON attachments
      const issues = result.rows.map(row => ({
        ...row,
        attachments: row.attachments ? JSON.parse(row.attachments) : null
      }));
      
      return issues;
    } catch (error) {
      console.error('Error fetching issues:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update issue
  static async update(id, updates) {
    const client = await pool.connect();
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      const allowedFields = [
        'description', 'status', 'priority', 'type_id', 'sub_type_id',
        'assigned_to', 'attachment_url', 'attachments', 'mapped_type_id',
        'mapped_sub_type_id', 'mapped_by', 'mapped_at', 'closed_at'
      ];

      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          if (field === 'attachments') {
            fields.push(`${field} = $${paramCount}`);
            values.push(JSON.stringify(updates[field]));
          } else {
            fields.push(`${field} = $${paramCount}`);
            values.push(updates[field]);
          }
          paramCount++;
        }
      });

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await client.query(
        `UPDATE issues SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        throw new Error('Issue not found');
      }

      return this.findById(id);
    } catch (error) {
      console.error('Error updating issue:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete issue
  static async delete(id) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM issues WHERE id = $1',
        [id]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting issue:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get issue statistics
  static async getStats(filters = {}) {
    const client = await pool.connect();
    try {
      let baseQuery = `
        FROM issues i 
        LEFT JOIN employees e ON i.employee_id = e.id
        WHERE 1=1
      `;
      
      const values = [];
      let paramCount = 1;
      
      if (filters.city) {
        baseQuery += ` AND e.city = $${paramCount}`;
        values.push(filters.city);
        paramCount++;
      }
      
      if (filters.cluster) {
        baseQuery += ` AND e.cluster = $${paramCount}`;
        values.push(filters.cluster);
        paramCount++;
      }
      
      if (filters.startDate) {
        baseQuery += ` AND i.created_at >= $${paramCount}`;
        values.push(filters.startDate);
        paramCount++;
      }
      
      if (filters.endDate) {
        baseQuery += ` AND i.created_at <= $${paramCount}`;
        values.push(filters.endDate);
        paramCount++;
      }

      // Total count
      const totalResult = await client.query(
        `SELECT COUNT(*) as total ${baseQuery}`,
        values
      );

      // Status stats
      const statusResult = await client.query(
        `SELECT status, COUNT(*) as count ${baseQuery} GROUP BY status`,
        values
      );

      // Priority stats
      const priorityResult = await client.query(
        `SELECT priority, COUNT(*) as count ${baseQuery} GROUP BY priority`,
        values
      );

      // Type stats
      const typeResult = await client.query(
        `SELECT type_id, COUNT(*) as count ${baseQuery} GROUP BY type_id`,
        values
      );

      return {
        total: parseInt(totalResult.rows[0].total),
        byStatus: statusResult.rows,
        byPriority: priorityResult.rows,
        byType: typeResult.rows
      };
    } catch (error) {
      console.error('Error fetching issue stats:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get issues assigned to a specific user
  static async findByAssignee(assigneeId, filters = {}) {
    const client = await pool.connect();
    try {
      let query = `
        SELECT i.*, e.name as employee_name, e.email as employee_email
        FROM issues i 
        LEFT JOIN employees e ON i.employee_id = e.id
        WHERE i.assigned_to = $1
      `;
      
      const values = [assigneeId];
      let paramCount = 2;

      if (filters.status) {
        query += ` AND i.status = $${paramCount}`;
        values.push(filters.status);
        paramCount++;
      }

      query += ' ORDER BY i.created_at DESC';

      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error fetching issues by assignee:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Issue;