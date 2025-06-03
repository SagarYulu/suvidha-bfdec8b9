
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const issuesService = {
  async getIssues(filters, user) {
    const { status, priority, typeId, city, assignedTo, startDate, endDate } = filters;
    const userId = user.id;
    const userRole = user.role;

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

    // Role-based filtering
    if (userRole === 'employee') {
      query += ' AND i.employee_uuid = ?';
      params.push(userId);
    }

    // Apply filters
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

    if (city) {
      query += ' AND e.city = ?';
      params.push(city);
    }

    if (assignedTo) {
      query += ' AND i.assigned_to = ?';
      params.push(assignedTo);
    }

    if (startDate) {
      query += ' AND DATE(i.created_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND DATE(i.created_at) <= ?';
      params.push(endDate);
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
        e.email as employee_email,
        e.phone as employee_phone,
        e.city,
        e.cluster,
        e.manager as manager_name,
        du.name as assigned_to_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      LEFT JOIN dashboard_users du ON i.assigned_to = du.id
      WHERE i.id = ?
    `;

    const issues = await new Promise((resolve, reject) => {
      db.query(query, [issueId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (issues.length === 0) {
      throw new Error('Issue not found');
    }

    const issue = issues[0];

    // Get comments for this issue
    const commentsQuery = `
      SELECT 
        ic.*,
        e.name as commenter_name,
        du.name as admin_name
      FROM issue_comments ic
      LEFT JOIN employees e ON ic.employee_uuid = e.id
      LEFT JOIN dashboard_users du ON ic.admin_user_id = du.id
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
    const { typeId, subTypeId, description, priority = 'medium', employeeUuid, attachmentUrl } = issueData;
    const issueId = uuidv4();
    
    const insertQuery = `
      INSERT INTO issues (id, employee_uuid, type_id, sub_type_id, description, status, priority, attachment_url)
      VALUES (?, ?, ?, ?, ?, 'open', ?, ?)
    `;

    await new Promise((resolve, reject) => {
      db.query(insertQuery, [issueId, employeeUuid, typeId, subTypeId, description, priority, attachmentUrl], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    return {
      success: true,
      issueId,
      message: 'Issue created successfully'
    };
  },

  async updateIssueStatus(issueId, status) {
    const closedAt = ['closed', 'resolved'].includes(status) ? new Date() : null;

    const updateQuery = `
      UPDATE issues 
      SET status = ?, closed_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const result = await new Promise((resolve, reject) => {
      db.query(updateQuery, [status, closedAt, issueId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      throw new Error('Issue not found');
    }
  },

  async assignIssue(issueId, assignedTo) {
    const updateQuery = `
      UPDATE issues 
      SET assigned_to = ?, status = 'in_progress', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const result = await new Promise((resolve, reject) => {
      db.query(updateQuery, [assignedTo, issueId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      throw new Error('Issue not found');
    }
  },

  async addComment(issueId, content, user) {
    const userId = user.id;
    const userRole = user.role;

    // Determine if it's an employee or admin comment
    const isEmployee = userRole === 'employee';
    const employeeUuid = isEmployee ? userId : null;
    const adminUserId = isEmployee ? null : userId;

    const insertQuery = `
      INSERT INTO issue_comments (issue_id, employee_uuid, admin_user_id, content)
      VALUES (?, ?, ?, ?)
    `;

    await new Promise((resolve, reject) => {
      db.query(insertQuery, [issueId, employeeUuid, adminUserId, content], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },

  async getEmployeeIssues(employeeUuid) {
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
      db.query(query, [employeeUuid], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
};

module.exports = issuesService;
