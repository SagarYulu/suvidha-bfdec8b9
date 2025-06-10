
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
      employee_id,
      created_by,
      additional_details = null
    } = issueData;
    
    const issueId = uuidv4();
    
    const [result] = await pool.execute(
      `INSERT INTO issues 
       (id, title, description, issue_type, issue_subtype, priority, status, 
        employee_id, created_by, additional_details, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, NOW())`,
      [issueId, title, description, issue_type, issue_subtype, priority, 
       employee_id, created_by, JSON.stringify(additional_details)]
    );
    
    // Log audit trail
    await this.logAuditTrail(issueId, created_by, 'created', null, 'open');
    
    return this.findById(issueId);
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT i.*, 
              e.emp_name, e.emp_email, e.emp_mobile, e.emp_code,
              c.cluster_name, ct.city_name,
              creator.full_name as created_by_name,
              assignee.full_name as assigned_to_name
       FROM issues i
       LEFT JOIN employees e ON i.employee_id = e.id
       LEFT JOIN master_clusters c ON e.cluster_id = c.id
       LEFT JOIN master_cities ct ON c.city_id = ct.id
       LEFT JOIN dashboard_users creator ON i.created_by = creator.id
       LEFT JOIN dashboard_users assignee ON i.assigned_to = assignee.id
       WHERE i.id = ?`,
      [id]
    );
    
    return rows[0] || null;
  }

  static async findAll(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT i.*, 
             e.emp_name, e.emp_email, e.emp_code,
             c.cluster_name, ct.city_name,
             creator.full_name as created_by_name,
             assignee.full_name as assigned_to_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_id = e.id
      LEFT JOIN master_clusters c ON e.cluster_id = c.id
      LEFT JOIN master_cities ct ON c.city_id = ct.id
      LEFT JOIN dashboard_users creator ON i.created_by = creator.id
      LEFT JOIN dashboard_users assignee ON i.assigned_to = assignee.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query += ` AND i.status IN (${filters.status.map(() => '?').join(',')})`;
        params.push(...filters.status);
      } else {
        query += ' AND i.status = ?';
        params.push(filters.status);
      }
    }
    
    if (filters.priority) {
      if (Array.isArray(filters.priority)) {
        query += ` AND i.priority IN (${filters.priority.map(() => '?').join(',')})`;
        params.push(...filters.priority);
      } else {
        query += ' AND i.priority = ?';
        params.push(filters.priority);
      }
    }
    
    if (filters.issue_type) {
      query += ' AND i.issue_type = ?';
      params.push(filters.issue_type);
    }
    
    if (filters.assigned_to) {
      query += ' AND i.assigned_to = ?';
      params.push(filters.assigned_to);
    }
    
    if (filters.created_by) {
      query += ' AND i.created_by = ?';
      params.push(filters.created_by);
    }
    
    if (filters.cluster_id) {
      query += ' AND c.id = ?';
      params.push(filters.cluster_id);
    }
    
    if (filters.city_id) {
      query += ' AND ct.id = ?';
      params.push(filters.city_id);
    }
    
    if (filters.search) {
      query += ' AND (i.title LIKE ? OR i.description LIKE ? OR e.emp_name LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (filters.date_from) {
      query += ' AND i.created_at >= ?';
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      query += ' AND i.created_at <= ?';
      params.push(filters.date_to);
    }
    
    // Sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY i.${sortBy} ${sortOrder}`;
    
    // Pagination
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
      
      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(parseInt(filters.offset));
      }
    }
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async update(id, updates, updatedBy) {
    const pool = getPool();
    
    // Get current issue for audit trail
    const currentIssue = await this.findById(id);
    if (!currentIssue) {
      throw new Error('Issue not found');
    }
    
    const allowedFields = ['title', 'description', 'status', 'priority', 'assigned_to', 'resolution_notes'];
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(id);
    
    // If status is being changed to resolved or closed, set resolved_at
    if (updates.status && ['resolved', 'closed'].includes(updates.status)) {
      fields.push('resolved_at = NOW()');
    }
    
    await pool.execute(
      `UPDATE issues SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    // Log audit trail for significant changes
    for (const [field, newValue] of Object.entries(updates)) {
      if (allowedFields.includes(field) && currentIssue[field] !== newValue) {
        await this.logAuditTrail(id, updatedBy, `updated_${field}`, currentIssue[field], newValue);
      }
    }
    
    return this.findById(id);
  }

  static async delete(id) {
    const pool = getPool();
    const [result] = await pool.execute(
      'DELETE FROM issues WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  static async getCount(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT COUNT(*) as total 
      FROM issues i
      LEFT JOIN employees e ON i.employee_id = e.id
      LEFT JOIN master_clusters c ON e.cluster_id = c.id
      LEFT JOIN master_cities ct ON c.city_id = ct.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query += ` AND i.status IN (${filters.status.map(() => '?').join(',')})`;
        params.push(...filters.status);
      } else {
        query += ' AND i.status = ?';
        params.push(filters.status);
      }
    }
    
    if (filters.assigned_to) {
      query += ' AND i.assigned_to = ?';
      params.push(filters.assigned_to);
    }
    
    if (filters.created_by) {
      query += ' AND i.created_by = ?';
      params.push(filters.created_by);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  static async getStatistics() {
    const pool = getPool();
    
    const [statusStats] = await pool.execute(`
      SELECT status, COUNT(*) as count 
      FROM issues 
      GROUP BY status
    `);
    
    const [priorityStats] = await pool.execute(`
      SELECT priority, COUNT(*) as count 
      FROM issues 
      GROUP BY priority
    `);
    
    const [typeStats] = await pool.execute(`
      SELECT issue_type, COUNT(*) as count 
      FROM issues 
      GROUP BY issue_type
    `);
    
    const [totalCount] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed
      FROM issues
    `);
    
    return {
      statusStats,
      priorityStats,
      typeStats,
      totalCount: totalCount[0]
    };
  }

  static async logAuditTrail(issueId, userId, action, oldValue, newValue) {
    const pool = getPool();
    const auditId = uuidv4();
    
    await pool.execute(
      `INSERT INTO issue_audit_trail 
       (id, issue_id, user_id, action, old_value, new_value, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [auditId, issueId, userId, action, oldValue, newValue]
    );
  }

  static async getAuditTrail(issueId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT a.*, u.full_name as user_name 
       FROM issue_audit_trail a
       LEFT JOIN dashboard_users u ON a.user_id = u.id
       WHERE a.issue_id = ? 
       ORDER BY a.created_at DESC`,
      [issueId]
    );
    
    return rows;
  }
}

module.exports = Issue;
