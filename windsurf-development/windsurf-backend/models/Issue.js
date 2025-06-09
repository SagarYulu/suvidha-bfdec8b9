
const { pool } = require('../config/database');

class IssueModel {
  static async findById(id) {
    const [issues] = await pool.execute(`
      SELECT i.*, 
             e.name as employee_name,
             du.name as assignee_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      LEFT JOIN dashboard_users du ON i.assigned_to = du.id
      WHERE i.id = ?
    `, [id]);
    
    return issues[0];
  }

  static async create(issueData) {
    const { id, employee_uuid, type_id, sub_type_id, description, status, priority, attachment_url, attachments } = issueData;
    
    await pool.execute(`
      INSERT INTO issues (id, employee_uuid, type_id, sub_type_id, description, status, priority, attachment_url, attachments, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [id, employee_uuid, type_id, sub_type_id, description, status || 'open', priority || 'medium', attachment_url, attachments]);

    return this.findById(id);
  }

  static async update(id, updateData) {
    const { status, priority, assigned_to, description } = updateData;
    
    await pool.execute(`
      UPDATE issues 
      SET status = COALESCE(?, status), 
          priority = COALESCE(?, priority), 
          assigned_to = COALESCE(?, assigned_to),
          description = COALESCE(?, description),
          updated_at = NOW()
      WHERE id = ?
    `, [status, priority, assigned_to, description, id]);

    return this.findById(id);
  }

  static async assignIssue(issueId, assignedTo) {
    await pool.execute(`
      UPDATE issues 
      SET assigned_to = ?, status = 'in_progress', updated_at = NOW()
      WHERE id = ?
    `, [assignedTo, issueId]);
    
    return this.findById(issueId);
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT i.*, 
             e.name as employee_name,
             du.name as assignee_name
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      LEFT JOIN dashboard_users du ON i.assigned_to = du.id
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

    if (filters.employeeUuid) {
      query += ' AND i.employee_uuid = ?';
      params.push(filters.employeeUuid);
    }

    query += ' ORDER BY i.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(parseInt(filters.offset));
    }

    const [issues] = await pool.execute(query, params);
    return issues;
  }

  static async getAnalytics() {
    const [totalCount] = await pool.execute('SELECT COUNT(*) as total FROM issues');
    const [statusCounts] = await pool.execute(`
      SELECT status, COUNT(*) as count 
      FROM issues 
      GROUP BY status
    `);
    const [priorityCounts] = await pool.execute(`
      SELECT priority, COUNT(*) as count 
      FROM issues 
      GROUP BY priority
    `);

    return {
      totalIssues: totalCount[0].total,
      statusBreakdown: statusCounts,
      priorityBreakdown: priorityCounts
    };
  }
}

module.exports = IssueModel;
