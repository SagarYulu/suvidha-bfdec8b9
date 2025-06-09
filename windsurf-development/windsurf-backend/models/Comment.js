
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class CommentModel {
  static async create(commentData) {
    const { issue_id, employee_uuid, content } = commentData;
    const id = uuidv4();

    await pool.execute(`
      INSERT INTO issue_comments (id, issue_id, employee_uuid, content, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [id, issue_id, employee_uuid, content]);

    return { id, ...commentData };
  }

  static async createInternal(commentData) {
    const { issue_id, employee_uuid, content } = commentData;
    const id = uuidv4();

    await pool.execute(`
      INSERT INTO issue_internal_comments (id, issue_id, employee_uuid, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `, [id, issue_id, employee_uuid, content]);

    return { id, ...commentData };
  }

  static async getByIssue(issueId) {
    const [comments] = await pool.execute(`
      SELECT c.*, e.name as employee_name
      FROM issue_comments c
      LEFT JOIN employees e ON c.employee_uuid = e.id
      WHERE c.issue_id = ?
      ORDER BY c.created_at ASC
    `, [issueId]);
    return comments;
  }

  static async getInternalByIssue(issueId) {
    const [comments] = await pool.execute(`
      SELECT c.*, u.name as user_name
      FROM issue_internal_comments c
      LEFT JOIN dashboard_users u ON c.employee_uuid = u.id
      WHERE c.issue_id = ?
      ORDER BY c.created_at ASC
    `, [issueId]);
    return comments;
  }
}

module.exports = CommentModel;
