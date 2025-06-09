
const { pool } = require('../config/database');

class IssueModel {
  // Get all issues with filters and pagination
  async getAllIssues(filters = {}, pagination = {}) {
    const { 
      status, 
      priority, 
      typeId, 
      assignedTo, 
      employeeUuid, 
      city, 
      cluster,
      startDate,
      endDate 
    } = filters;
    
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = pagination;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        i.*,
        e.name as employee_name,
        e.emp_id,
        e.city as employee_city,
        e.cluster as employee_cluster,
        du.name as assigned_to_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      LEFT JOIN dashboard_users du ON i.assigned_to = du.id
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
    
    if (typeId) {
      query += ' AND i.type_id = ?';
      params.push(typeId);
    }
    
    if (assignedTo) {
      query += ' AND i.assigned_to = ?';
      params.push(assignedTo);
    }
    
    if (employeeUuid) {
      query += ' AND i.employee_uuid = ?';
      params.push(employeeUuid);
    }
    
    if (city) {
      query += ' AND e.city = ?';
      params.push(city);
    }
    
    if (cluster) {
      query += ' AND e.cluster = ?';
      params.push(cluster);
    }
    
    if (startDate) {
      query += ' AND i.created_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND i.created_at <= ?';
      params.push(endDate);
    }
    
    query += ` ORDER BY i.${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const [issues] = await pool.execute(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      WHERE 1=1
    `;
    
    const countParams = params.slice(0, -2); // Remove limit and offset
    
    if (status) countQuery += ' AND i.status = ?';
    if (priority) countQuery += ' AND i.priority = ?';
    if (typeId) countQuery += ' AND i.type_id = ?';
    if (assignedTo) countQuery += ' AND i.assigned_to = ?';
    if (employeeUuid) countQuery += ' AND i.employee_uuid = ?';
    if (city) countQuery += ' AND e.city = ?';
    if (cluster) countQuery += ' AND e.cluster = ?';
    if (startDate) countQuery += ' AND i.created_at >= ?';
    if (endDate) countQuery += ' AND i.created_at <= ?';
    
    const [countResult] = await pool.execute(countQuery, countParams);
    
    return {
      issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  }

  // Get single issue by ID
  async getIssueById(id) {
    const query = `
      SELECT 
        i.*,
        e.name as employee_name,
        e.emp_id,
        e.email as employee_email,
        e.phone as employee_phone,
        e.city as employee_city,
        e.cluster as employee_cluster,
        du.name as assigned_to_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      LEFT JOIN dashboard_users du ON i.assigned_to = du.id
      WHERE i.id = ?
    `;
    
    const [issues] = await pool.execute(query, [id]);
    return issues[0] || null;
  }

  // Create new issue
  async createIssue(issueData) {
    const {
      id,
      employeeUuid,
      typeId,
      subTypeId,
      description,
      priority = 'medium',
      attachments = null
    } = issueData;

    const query = `
      INSERT INTO issues (
        id, employee_uuid, type_id, sub_type_id, description, 
        priority, status, attachments, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'open', ?, NOW(), NOW())
    `;

    await pool.execute(query, [
      id, employeeUuid, typeId, subTypeId, description, priority, attachments
    ]);

    return this.getIssueById(id);
  }

  // Update issue
  async updateIssue(id, updateData) {
    const allowedFields = ['status', 'priority', 'assigned_to', 'mapped_type_id', 'mapped_sub_type_id', 'mapped_by'];
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Add special handling for status changes
    if (updateData.status === 'closed') {
      fields.push('closed_at = NOW()');
    }

    if (updateData.mapped_type_id) {
      fields.push('mapped_at = NOW()');
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    const query = `UPDATE issues SET ${fields.join(', ')} WHERE id = ?`;
    await pool.execute(query, values);

    return this.getIssueById(id);
  }

  // Get issue comments
  async getIssueComments(issueId) {
    const query = `
      SELECT 
        ic.*,
        e.name as employee_name,
        e.emp_id
      FROM issue_comments ic
      LEFT JOIN employees e ON ic.employee_uuid = e.id
      WHERE ic.issue_id = ?
      ORDER BY ic.created_at ASC
    `;

    const [comments] = await pool.execute(query, [issueId]);
    return comments;
  }

  // Add comment to issue
  async addComment(issueId, employeeUuid, content) {
    const query = `
      INSERT INTO issue_comments (issue_id, employee_uuid, content, created_at)
      VALUES (?, ?, ?, NOW())
    `;

    await pool.execute(query, [issueId, employeeUuid, content]);
    return this.getIssueComments(issueId);
  }

  // Get issue internal comments
  async getInternalComments(issueId) {
    const query = `
      SELECT 
        iic.*,
        du.name as user_name
      FROM issue_internal_comments iic
      LEFT JOIN dashboard_users du ON iic.employee_uuid = du.id
      WHERE iic.issue_id = ?
      ORDER BY iic.created_at ASC
    `;

    const [comments] = await pool.execute(query, [issueId]);
    return comments;
  }

  // Add internal comment
  async addInternalComment(issueId, employeeUuid, content) {
    const query = `
      INSERT INTO issue_internal_comments (issue_id, employee_uuid, content, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `;

    await pool.execute(query, [issueId, employeeUuid, content]);
    return this.getInternalComments(issueId);
  }

  // Delete issue
  async deleteIssue(id) {
    const query = 'DELETE FROM issues WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Get issues by employee
  async getIssuesByEmployee(employeeUuid, filters = {}) {
    const { status, limit = 10 } = filters;
    
    let query = `
      SELECT i.*, e.name as employee_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      WHERE i.employee_uuid = ?
    `;
    
    const params = [employeeUuid];
    
    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY i.created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [issues] = await pool.execute(query, params);
    return issues;
  }

  // Get dashboard metrics
  async getDashboardMetrics() {
    const query = `
      SELECT 
        COUNT(*) as total_issues,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_issues,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_issues,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_issues,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) as issues_last_24h,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as issues_last_week
      FROM issues
    `;

    const [metrics] = await pool.execute(query);
    return metrics[0];
  }
}

module.exports = new IssueModel();
