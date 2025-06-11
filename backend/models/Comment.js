
const { getPool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Comment {
  static async create(commentData) {
    const pool = getPool();
    const { issue_id, employee_uuid, content } = commentData;
    const commentId = uuidv4();
    
    const [result] = await pool.execute(
      `INSERT INTO issue_comments 
       (id, issue_id, employee_uuid, content, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [commentId, issue_id, employee_uuid, content]
    );
    
    return this.findById(commentId);
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT c.*, e.emp_name as author_name, e.role as author_role
       FROM issue_comments c
       LEFT JOIN employees e ON c.employee_uuid = e.id
       WHERE c.id = ?`,
      [id]
    );
    
    return rows[0] || null;
  }

  static async findByIssueId(issueId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT c.*, e.emp_name as author_name, e.role as author_role
       FROM issue_comments c
       LEFT JOIN employees e ON c.employee_uuid = e.id
       WHERE c.issue_id = ?
       ORDER BY c.created_at ASC`,
      [issueId]
    );
    
    return rows;
  }

  static async update(id, updates) {
    const pool = getPool();
    const allowedFields = ['content'];
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(id);
    
    await pool.execute(
      `UPDATE issue_comments SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return this.findById(id);
  }

  static async delete(id) {
    const pool = getPool();
    const [result] = await pool.execute(
      'DELETE FROM issue_comments WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = Comment;
