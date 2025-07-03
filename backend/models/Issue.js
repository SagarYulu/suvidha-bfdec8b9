const { pool } = require('../config/db');

class Issue {
  // Create a new issue
  static async create(issueData) {
    const connection = await pool.getConnection();
    try {
      const {
        description, status = 'open', priority = 'medium', type_id, sub_type_id,
        employee_uuid, assigned_to, attachment_url, attachments
      } = issueData;

      const [result] = await connection.execute(
        `INSERT INTO issues (
          description, status, priority, type_id, sub_type_id, employee_uuid,
          assigned_to, attachment_url, attachments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          description, status, priority, type_id, sub_type_id, employee_uuid,
          assigned_to, attachment_url, JSON.stringify(attachments)
        ]
      );

      return this.findById(result.insertId);
    } finally {
      connection.release();
    }
  }

  // Find issue by ID with employee details
  static async findById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT i.*, e.name as employee_name, e.email as employee_email,
                da.name as assigned_to_name
         FROM issues i 
         LEFT JOIN employees e ON i.employee_uuid = e.id
         LEFT JOIN dashboard_users da ON i.assigned_to = da.id
         WHERE i.id = ?`,
        [id]
      );
      
      if (rows[0] && rows[0].attachments) {
        rows[0].attachments = JSON.parse(rows[0].attachments);
      }
      
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  // Get all issues with optional filters
  static async findAll(filters = {}) {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT i.*, e.name as employee_name, e.email as employee_email, e.city, e.cluster,
               da.name as assigned_to_name
        FROM issues i 
        LEFT JOIN employees e ON i.employee_uuid = e.id
        LEFT JOIN dashboard_users da ON i.assigned_to = da.id
        WHERE 1=1
      `;
      const values = [];

      if (filters.status) {
        query += ' AND i.status = ?';
        values.push(filters.status);
      }

      if (filters.priority) {
        query += ' AND i.priority = ?';
        values.push(filters.priority);
      }

      if (filters.assigned_to) {
        query += ' AND i.assigned_to = ?';
        values.push(filters.assigned_to);
      }

      if (filters.employee_uuid) {
        query += ' AND i.employee_uuid = ?';
        values.push(filters.employee_uuid);
      }

      if (filters.city) {
        query += ' AND e.city = ?';
        values.push(filters.city);
      }

      if (filters.cluster) {
        query += ' AND e.cluster = ?';
        values.push(filters.cluster);
      }

      if (filters.type_id) {
        query += ' AND i.type_id = ?';
        values.push(filters.type_id);
      }

      if (filters.startDate) {
        query += ' AND i.created_at >= ?';
        values.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ' AND i.created_at <= ?';
        values.push(filters.endDate);
      }

      if (filters.search) {
        query += ' AND (i.description LIKE ? OR e.name LIKE ? OR e.email LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        values.push(searchTerm, searchTerm, searchTerm);
      }

      query += ' ORDER BY i.created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        values.push(parseInt(filters.limit));
      }

      const [rows] = await connection.execute(query, values);
      
      // Parse attachments JSON
      rows.forEach(row => {
        if (row.attachments) {
          try {
            row.attachments = JSON.parse(row.attachments);
          } catch (e) {
            row.attachments = null;
          }
        }
      });

      return rows;
    } finally {
      connection.release();
    }
  }

  // Update issue
  static async update(id, updates) {
    const connection = await pool.getConnection();
    try {
      const fields = [];
      const values = [];

      const allowedFields = [
        'description', 'status', 'priority', 'type_id', 'sub_type_id',
        'assigned_to', 'attachment_url', 'attachments', 'mapped_type_id',
        'mapped_sub_type_id', 'mapped_by', 'mapped_at', 'closed_at'
      ];

      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          if (field === 'attachments') {
            fields.push(`${field} = ?`);
            values.push(JSON.stringify(updates[field]));
          } else {
            fields.push(`${field} = ?`);
            values.push(updates[field]);
          }
        }
      });

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(id);

      const [result] = await connection.execute(
        `UPDATE issues SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        throw new Error('Issue not found');
      }

      return this.findById(id);
    } finally {
      connection.release();
    }
  }

  // Delete issue
  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM issues WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  // Get issue statistics
  static async getStats(filters = {}) {
    const connection = await pool.getConnection();
    try {
      let baseQuery = `
        FROM issues i 
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE 1=1
      `;
      const values = [];

      if (filters.city) {
        baseQuery += ' AND e.city = ?';
        values.push(filters.city);
      }

      if (filters.cluster) {
        baseQuery += ' AND e.cluster = ?';
        values.push(filters.cluster);
      }

      if (filters.startDate) {
        baseQuery += ' AND i.created_at >= ?';
        values.push(filters.startDate);
      }

      if (filters.endDate) {
        baseQuery += ' AND i.created_at <= ?';
        values.push(filters.endDate);
      }

      // Total count
      const [totalCount] = await connection.execute(
        `SELECT COUNT(*) as total ${baseQuery}`,
        values
      );

      // Status stats
      const [statusStats] = await connection.execute(
        `SELECT status, COUNT(*) as count ${baseQuery} GROUP BY status`,
        values
      );

      // Priority stats
      const [priorityStats] = await connection.execute(
        `SELECT priority, COUNT(*) as count ${baseQuery} GROUP BY priority`,
        values
      );

      // Type stats
      const [typeStats] = await connection.execute(
        `SELECT type_id, COUNT(*) as count ${baseQuery} GROUP BY type_id`,
        values
      );

      return {
        total: totalCount[0].total,
        byStatus: statusStats,
        byPriority: priorityStats,
        byType: typeStats
      };
    } finally {
      connection.release();
    }
  }

  // Get issues assigned to a specific user
  static async findByAssignee(assigneeId, filters = {}) {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT i.*, e.name as employee_name, e.email as employee_email
        FROM issues i 
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE i.assigned_to = ?
      `;
      const values = [assigneeId];

      if (filters.status) {
        query += ' AND i.status = ?';
        values.push(filters.status);
      }

      query += ' ORDER BY i.created_at DESC';

      const [rows] = await connection.execute(query, values);
      return rows;
    } finally {
      connection.release();
    }
  }
}

module.exports = Issue;