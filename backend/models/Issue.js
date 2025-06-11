
const { getPool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Issue {
  static async create(issueData) {
    const pool = getPool();
    const {
      title,
      description,
      issue_type,
      issue_subtype,
      priority = 'medium',
      status = 'open',
      employee_id,
      created_by,
      assigned_to,
      additional_details,
      attachment_urls
    } = issueData;
    
    const issueId = uuidv4();
    
    const [result] = await pool.execute(
      `INSERT INTO issues 
       (id, title, description, issue_type, issue_subtype, priority, status, 
        employee_id, created_by, assigned_to, additional_details, attachment_urls, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [issueId, title, description, issue_type, issue_subtype, priority, status,
       employee_id, created_by, assigned_to, 
       additional_details ? JSON.stringify(additional_details) : null,
       attachment_urls ? JSON.stringify(attachment_urls) : null]
    );
    
    return this.findById(issueId);
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT i.*, 
              e.emp_name, e.emp_email, e.emp_code, e.cluster as cluster_name, e.city as city_name,
              u1.full_name as created_by_name,
              u2.full_name as assigned_to_name
       FROM issues i 
       LEFT JOIN employees e ON i.employee_id = e.id
       LEFT JOIN dashboard_users u1 ON i.created_by = u1.id
       LEFT JOIN dashboard_users u2 ON i.assigned_to = u2.id
       WHERE i.id = ?`,
      [id]
    );
    
    if (rows[0]) {
      const issue = rows[0];
      if (issue.additional_details) {
        issue.additional_details = JSON.parse(issue.additional_details);
      }
      if (issue.attachment_urls) {
        issue.attachment_urls = JSON.parse(issue.attachment_urls);
      }
    }
    
    return rows[0] || null;
  }

  static async findAll(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT i.*, 
             e.emp_name, e.emp_email, e.emp_code, e.cluster as cluster_name, e.city as city_name,
             u1.full_name as created_by_name,
             u2.full_name as assigned_to_name
      FROM issues i 
      LEFT JOIN employees e ON i.employee_id = e.id
      LEFT JOIN dashboard_users u1 ON i.created_by = u1.id
      LEFT JOIN dashboard_users u2 ON i.assigned_to = u2.id
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.status) {
      query += ' AND i.status = ?';
      params.push(filters.status);
    }
    
    if (filters.priority) {
      query += ' AND i.priority = ?';
      params.push(filters.priority);
    }
    
    if (filters.assignedTo) {
      query += ' AND i.assigned_to = ?';
      params.push(filters.assignedTo);
    }
    
    if (filters.city) {
      query += ' AND e.city = ?';
      params.push(filters.city);
    }
    
    if (filters.cluster) {
      query += ' AND e.cluster = ?';
      params.push(filters.cluster);
    }
    
    if (filters.dateFrom) {
      query += ' AND i.created_at >= ?';
      params.push(filters.dateFrom);
    }
    
    if (filters.dateTo) {
      query += ' AND i.created_at <= ?';
      params.push(filters.dateTo);
    }
    
    query += ' ORDER BY i.created_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
      
      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(parseInt(filters.offset));
      }
    }
    
    const [rows] = await pool.execute(query, params);
    
    return rows.map(issue => {
      if (issue.additional_details) {
        issue.additional_details = JSON.parse(issue.additional_details);
      }
      if (issue.attachment_urls) {
        issue.attachment_urls = JSON.parse(issue.attachment_urls);
      }
      return issue;
    });
  }

  static async update(id, updates) {
    const pool = getPool();
    const allowedFields = [
      'title', 'description', 'status', 'priority', 'assigned_to', 
      'resolved_at', 'additional_details', 'attachment_urls'
    ];
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        if (key === 'additional_details' || key === 'attachment_urls') {
          fields.push(`${key} = ?`);
          values.push(updates[key] ? JSON.stringify(updates[key]) : null);
        } else {
          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      }
    });
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(id);
    
    await pool.execute(
      `UPDATE issues SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    return this.findById(id);
  }

  static async delete(id) {
    const pool = getPool();
    await pool.execute('DELETE FROM issues WHERE id = ?', [id]);
  }

  static async getCount(filters = {}) {
    const pool = getPool();
    let query = 'SELECT COUNT(*) as count FROM issues i LEFT JOIN employees e ON i.employee_id = e.id WHERE 1=1';
    const params = [];
    
    if (filters.status) {
      query += ' AND i.status = ?';
      params.push(filters.status);
    }
    
    if (filters.priority) {
      query += ' AND i.priority = ?';
      params.push(filters.priority);
    }
    
    if (filters.city) {
      query += ' AND e.city = ?';
      params.push(filters.city);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows[0].count;
  }

  static async getStatistics() {
    const pool = getPool();
    
    const [statusStats] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
        COUNT(*) as total
      FROM issues
    `);
    
    const [avgResolution] = await pool.execute(`
      SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avgResolutionTime
      FROM issues 
      WHERE resolved_at IS NOT NULL
    `);
    
    return {
      ...statusStats[0],
      avgResolutionTime: avgResolution[0]?.avgResolutionTime || 0
    };
  }
}

module.exports = Issue;
