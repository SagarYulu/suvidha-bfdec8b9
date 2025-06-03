
const database = require('../config/database');
const Issue = require('../models/Issue');

class IssueService {
  async createIssue(issueData) {
    const issue = new Issue(issueData);

    const query = `
      INSERT INTO issues (
        id, employee_uuid, type_id, sub_type_id, description, 
        status, priority, assigned_to, attachment_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      issue.id, issue.employeeUuid, issue.typeId, issue.subTypeId,
      issue.description, issue.status, issue.priority, issue.assignedTo,
      issue.attachmentUrl
    ];

    await database.query(query, params);
    return this.getIssueById(issue.id);
  }

  async getIssueById(issueId) {
    const query = `
      SELECT 
        i.*,
        u.name as employee_name,
        u.employee_id,
        u.city,
        u.cluster,
        au.name as assigned_to_name
      FROM issues i
      LEFT JOIN dashboard_users u ON i.employee_uuid = u.id
      LEFT JOIN dashboard_users au ON i.assigned_to = au.id
      WHERE i.id = ?
    `;

    const rows = await database.query(query, [issueId]);
    if (rows.length === 0) {
      return null;
    }

    const issue = Issue.fromDatabase(rows[0]);
    return {
      ...issue,
      employeeName: rows[0].employee_name,
      employeeId: rows[0].employee_id,
      city: rows[0].city,
      cluster: rows[0].cluster,
      assignedToName: rows[0].assigned_to_name
    };
  }

  async getAllIssues(filters = {}, userRole = null, userId = null) {
    let query = `
      SELECT 
        i.*,
        u.name as employee_name,
        u.employee_id,
        u.city,
        u.cluster,
        au.name as assigned_to_name
      FROM issues i
      LEFT JOIN dashboard_users u ON i.employee_uuid = u.id
      LEFT JOIN dashboard_users au ON i.assigned_to = au.id
      WHERE 1=1
    `;
    
    const params = [];

    // Role-based filtering
    if (userRole === 'employee') {
      query += ' AND i.employee_uuid = ?';
      params.push(userId);
    }

    // Apply filters
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

    if (filters.startDate) {
      query += ' AND DATE(i.created_at) >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND DATE(i.created_at) <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY i.created_at DESC';

    const rows = await database.query(query, params);
    return rows.map(row => ({
      ...Issue.fromDatabase(row),
      employeeName: row.employee_name,
      employeeId: row.employee_id,
      city: row.city,
      cluster: row.cluster,
      assignedToName: row.assigned_to_name
    }));
  }

  async updateIssueStatus(issueId, status, userId) {
    const closedAt = ['closed', 'resolved'].includes(status) ? new Date() : null;
    
    const query = `
      UPDATE issues 
      SET status = ?, closed_at = ?, updated_at = ?
      WHERE id = ?
    `;

    const result = await database.query(query, [status, closedAt, new Date(), issueId]);
    
    if (result.affectedRows === 0) {
      throw new Error('Issue not found');
    }

    return this.getIssueById(issueId);
  }

  async assignIssue(issueId, assignedTo) {
    const query = `
      UPDATE issues 
      SET assigned_to = ?, status = 'in_progress', updated_at = ?
      WHERE id = ?
    `;

    const result = await database.query(query, [assignedTo, new Date(), issueId]);
    
    if (result.affectedRows === 0) {
      throw new Error('Issue not found');
    }

    return this.getIssueById(issueId);
  }

  async addComment(issueId, content, userId) {
    const query = `
      INSERT INTO issue_comments (id, issue_id, employee_uuid, content)
      VALUES (?, ?, ?, ?)
    `;

    const commentId = require('uuid').v4();
    await database.query(query, [commentId, issueId, userId, content]);
    
    return { id: commentId, issueId, userId, content, createdAt: new Date() };
  }

  async getIssueComments(issueId) {
    const query = `
      SELECT 
        ic.*,
        u.name as commenter_name
      FROM issue_comments ic
      LEFT JOIN dashboard_users u ON ic.employee_uuid = u.id
      WHERE ic.issue_id = ?
      ORDER BY ic.created_at ASC
    `;

    const rows = await database.query(query, [issueId]);
    return rows.map(row => ({
      id: row.id,
      issueId: row.issue_id,
      content: row.content,
      commenterName: row.commenter_name,
      createdAt: row.created_at
    }));
  }
}

module.exports = new IssueService();
