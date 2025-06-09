
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class IssueModel {
  static async create(issueData) {
    const { employee_uuid, type_id, sub_type_id, description, priority, status = 'open' } = issueData;
    const id = uuidv4();

    await pool.execute(`
      INSERT INTO issues (
        id, employee_uuid, type_id, sub_type_id, description, priority, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [id, employee_uuid, type_id, sub_type_id, description, priority, status]);

    return { id, ...issueData, status };
  }

  static async findById(id) {
    const [issues] = await pool.execute(`
      SELECT i.*, e.name as employee_name, e.email as employee_email
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
      WHERE i.id = ?
    `, [id]);
    return issues[0];
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT i.*, e.name as employee_name, e.email as employee_email
      FROM issues i
      LEFT JOIN employees e ON i.employee_uuid = e.id
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

    if (filters.employee_uuid) {
      query += ' AND i.employee_uuid = ?';
      params.push(filters.employee_uuid);
    }

    if (filters.assigned_to) {
      query += ' AND i.assigned_to = ?';
      params.push(filters.assigned_to);
    }

    query += ' ORDER BY i.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    const [issues] = await pool.execute(query, params);
    return issues;
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    await pool.execute(
      `UPDATE issues SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return true;
  }

  static async assignIssue(issueId, assignedTo) {
    await pool.execute(
      'UPDATE issues SET assigned_to = ?, updated_at = NOW() WHERE id = ?',
      [assignedTo, issueId]
    );
    return true;
  }

  static async getByEmployee(employeeId) {
    const [issues] = await pool.execute(
      'SELECT * FROM issues WHERE employee_uuid = ? ORDER BY created_at DESC',
      [employeeId]
    );
    return issues;
  }
}

module.exports = IssueModel;
