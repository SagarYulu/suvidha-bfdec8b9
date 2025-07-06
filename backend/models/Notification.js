
const { getPool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Notification {
  static async create(notificationData) {
    const pool = getPool();
    const { user_id, issue_id, content, type = 'info' } = notificationData;
    const notificationId = uuidv4();
    
    const [result] = await pool.execute(
      `INSERT INTO issue_notifications 
       (id, user_id, issue_id, content, type, is_read, created_at) 
       VALUES (?, ?, ?, ?, ?, FALSE, NOW())`,
      [notificationId, user_id, issue_id, content, type]
    );
    
    return this.findById(notificationId);
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT n.*, i.description as issue_description, i.status as issue_status
       FROM issue_notifications n
       LEFT JOIN issues i ON n.issue_id = i.id
       WHERE n.id = ?`,
      [id]
    );
    
    return rows[0] || null;
  }

  static async findByUserId(userId, options = {}) {
    const pool = getPool();
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT n.*, i.description as issue_description, i.status as issue_status
      FROM issue_notifications n
      LEFT JOIN issues i ON n.issue_id = i.id
      WHERE n.user_id = ?
    `;
    
    const params = [userId];
    
    if (unreadOnly) {
      query += ' AND n.is_read = FALSE';
    }
    
    query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getUnreadCount(userId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM issue_notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    
    return rows[0].count;
  }

  static async markAsRead(notificationId, userId) {
    const pool = getPool();
    
    await pool.execute(
      'UPDATE issue_notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
    
    return this.findById(notificationId);
  }

  static async markAllAsRead(userId) {
    const pool = getPool();
    
    const [result] = await pool.execute(
      'UPDATE issue_notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    
    return result.affectedRows;
  }

  static async delete(id) {
    const pool = getPool();
    const [result] = await pool.execute(
      'DELETE FROM issue_notifications WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = Notification;
