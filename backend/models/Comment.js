
const { getPool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Comment {
  static async create(commentData) {
    const pool = getPool();
    const { issue_id, user_id, content } = commentData;
    
    const commentId = uuidv4();
    
    const [result] = await pool.execute(
      `INSERT INTO comments (id, issue_id, user_id, content, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [commentId, issue_id, user_id, content]
    );
    
    return this.findById(commentId);
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT c.*, u.full_name as user_name 
       FROM comments c 
       LEFT JOIN dashboard_users u ON c.user_id = u.id 
       WHERE c.id = ?`,
      [id]
    );
    
    return rows[0] || null;
  }

  static async findByIssueId(issue_id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT c.*, u.full_name as user_name 
       FROM comments c 
       LEFT JOIN dashboard_users u ON c.user_id = u.id 
       WHERE c.issue_id = ? 
       ORDER BY c.created_at ASC`,
      [issue_id]
    );
    
    return rows;
  }

  static async update(id, updates) {
    const pool = getPool();
    const { content } = updates;
    
    await pool.execute(
      'UPDATE comments SET content = ?, updated_at = NOW() WHERE id = ?',
      [content, id]
    );
    
    return this.findById(id);
  }

  static async delete(id) {
    const pool = getPool();
    await pool.execute('DELETE FROM comments WHERE id = ?', [id]);
  }
}

module.exports = Comment;
