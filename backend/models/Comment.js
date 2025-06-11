
const { getPool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Comment {
  static async create(commentData) {
    const pool = getPool();
    const { issue_id, user_id, content } = commentData;
    
    const commentId = uuidv4();
    
    const [result] = await pool.execute(
      `INSERT INTO issue_comments 
       (id, issue_id, user_id, content, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [commentId, issue_id, user_id, content]
    );
    
    return this.findById(commentId);
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT c.*, u.full_name as user_name 
       FROM issue_comments c
       LEFT JOIN dashboard_users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [id]
    );
    
    return rows[0] || null;
  }

  static async findByIssueId(issueId, limit = 20, offset = 0) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT c.*, u.full_name as user_name 
       FROM issue_comments c
       LEFT JOIN dashboard_users u ON c.user_id = u.id
       WHERE c.issue_id = ? 
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [issueId, limit, offset]
    );
    
    return rows;
  }

  static async update(id, updates, userId) {
    const pool = getPool();
    const { content } = updates;
    
    await pool.execute(
      `UPDATE issue_comments 
       SET content = ?, updated_at = NOW() 
       WHERE id = ? AND user_id = ?`,
      [content, id, userId]
    );
    
    return this.findById(id);
  }

  static async delete(id, userId) {
    const pool = getPool();
    const [result] = await pool.execute(
      'DELETE FROM issue_comments WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = Comment;
