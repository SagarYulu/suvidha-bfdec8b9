
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const issuesService = {
  async getIssues(filters = {}, userRole, userId) {
    let query = `
      SELECT 
        i.*,
        e.name as employee_name,
        e.emp_id as employee_id,
        e.city,
        e.cluster,
        e.manager as manager_name,
        du.name as assigned_to_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      LEFT JOIN dashboard_users du ON i.assigned_to = du.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Apply filters based on user role
    if (userRole === 'employee') {
      query += ' AND i.employee_uuid = ?';
      params.push(userId);
    }
    
    // Apply query filters
    if (filters.status) {
      query += ' AND i.status = ?';
      params.push(filters.status);
    }
    
    if (filters.priority) {
      query += ' AND i.priority = ?';
      params.push(filters.priority);
    }
    
    if (filters.typeId) {
      query += ' AND i.type_id = ?';
      params.push(filters.typeId);
    }
    
    if (filters.city) {
      query += ' AND e.city = ?';
      params.push(filters.city);
    }
    
    if (filters.assignedTo) {
      query += ' AND i.assigned_to = ?';
      params.push(filters.assignedTo);
    }
    
    if (filters.startDate) {
      query += ' AND i.created_at >= ?';
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      query += ' AND i.created_at <= ?';
      params.push(filters.endDate);
    }
    
    query += ' ORDER BY i.created_at DESC';
    
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },

  async getIssueById(issueId, user) {
    const query = `
      SELECT 
        i.*,
        e.name as employee_name,
        e.emp_id as employee_id,
        e.city,
        e.cluster,
        e.manager as manager_name,
        du.name as assigned_to_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      LEFT JOIN dashboard_users du ON i.assigned_to = du.id
      WHERE i.id = ?
    `;
    
    const issue = await new Promise((resolve, reject) => {
      db.query(query, [issueId], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
    
    if (!issue) {
      throw new Error('Issue not found');
    }
    
    // Check access permissions
    if (user.role === 'employee' && issue.employee_uuid !== user.id) {
      throw new Error('Access denied');
    }
    
    // Get comments
    const commentsQuery = `
      SELECT 
        ic.*,
        e.name as commenter_name
      FROM issue_comments ic
      LEFT JOIN employees e ON ic.employee_uuid = e.id
      LEFT JOIN dashboard_users du ON ic.employee_uuid = du.id
      WHERE ic.issue_id = ?
      ORDER BY ic.created_at ASC
    `;
    
    const comments = await new Promise((resolve, reject) => {
      db.query(commentsQuery, [issueId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    issue.comments = comments;
    return issue;
  },

  async createIssue(issueData) {
    const id = uuidv4();
    const {
      employee_uuid,
      typeId,
      subTypeId,
      description,
      priority = 'medium',
      attachment_url
    } = issueData;
    
    const query = `
      INSERT INTO issues (
        id, employee_uuid, type_id, sub_type_id, description, 
        status, priority, attachment_url
      ) VALUES (?, ?, ?, ?, ?, 'open', ?, ?)
    `;
    
    await new Promise((resolve, reject) => {
      db.query(query, [
        id, employee_uuid, typeId, subTypeId, description, priority, attachment_url
      ], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    return id;
  },

  async updateIssueStatus(issueId, status, updatedBy) {
    const query = `
      UPDATE issues 
      SET status = ?, updated_at = NOW(), closed_at = CASE WHEN ? IN ('resolved', 'closed') THEN NOW() ELSE NULL END
      WHERE id = ?
    `;
    
    await new Promise((resolve, reject) => {
      db.query(query, [status, status, issueId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    // Log audit trail
    await this.logAuditTrail(issueId, updatedBy, 'status_changed', { new_status: status });
  },

  async assignIssue(issueId, assignedTo, assignedBy) {
    const query = `
      UPDATE issues 
      SET assigned_to = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await new Promise((resolve, reject) => {
      db.query(query, [assignedTo, issueId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    // Log audit trail
    await this.logAuditTrail(issueId, assignedBy, 'assigned', { assigned_to: assignedTo });
  },

  async addComment(issueId, content, commentBy) {
    const id = uuidv4();
    const query = `
      INSERT INTO issue_comments (id, issue_id, employee_uuid, content)
      VALUES (?, ?, ?, ?)
    `;
    
    await new Promise((resolve, reject) => {
      db.query(query, [id, issueId, commentBy, content], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    // Log audit trail
    await this.logAuditTrail(issueId, commentBy, 'comment_added', { comment_id: id });
  },

  async getEmployeeIssues(employeeId) {
    const query = `
      SELECT 
        i.*,
        e.name as employee_name,
        e.emp_id as employee_id,
        du.name as assigned_to_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      LEFT JOIN dashboard_users du ON i.assigned_to = du.id
      WHERE i.employee_uuid = ?
      ORDER BY i.created_at DESC
    `;
    
    return new Promise((resolve, reject) => {
      db.query(query, [employeeId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },

  async logAuditTrail(issueId, employeeUuid, action, details) {
    const id = uuidv4();
    const query = `
      INSERT INTO issue_audit_trail (id, issue_id, employee_uuid, action, details)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await new Promise((resolve, reject) => {
      db.query(query, [id, issueId, employeeUuid, action, JSON.stringify(details)], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
};

module.exports = issuesService;
