
const db = require('../config/database');

class NotificationModel {
  static async create(notificationData) {
    const query = `
      INSERT INTO notifications (
        id, user_id, issue_id, type, title, message, 
        is_read, sent_via, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const [result] = await db.execute(query, [
      notificationData.id,
      notificationData.user_id,
      notificationData.issue_id,
      notificationData.type,
      notificationData.title,
      notificationData.message,
      notificationData.is_read || false,
      notificationData.sent_via || 'in-app'
    ]);
    
    return this.findById(notificationData.id);
  }

  static async findById(id) {
    const query = `
      SELECT n.*, 
        u.name as user_name,
        u.email as user_email,
        i.description as issue_description
      FROM notifications n
      LEFT JOIN dashboard_users u ON n.user_id = u.id
      LEFT JOIN issues i ON n.issue_id = i.id
      WHERE n.id = ?
    `;
    
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  }

  static async findByUserId(userId, filters = {}) {
    let query = `
      SELECT n.*, 
        i.description as issue_description,
        i.status as issue_status
      FROM notifications n
      LEFT JOIN issues i ON n.issue_id = i.id
      WHERE n.user_id = ?
    `;
    
    const params = [userId];
    
    if (filters.is_read !== undefined) {
      query += ' AND n.is_read = ?';
      params.push(filters.is_read);
    }
    
    if (filters.type) {
      query += ' AND n.type = ?';
      params.push(filters.type);
    }
    
    query += ' ORDER BY n.created_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async markAsRead(id) {
    const query = `
      UPDATE notifications 
      SET is_read = true, read_at = NOW()
      WHERE id = ?
    `;
    
    await db.execute(query, [id]);
    return this.findById(id);
  }

  static async markAllAsRead(userId) {
    const query = `
      UPDATE notifications 
      SET is_read = true, read_at = NOW()
      WHERE user_id = ? AND is_read = false
    `;
    
    const [result] = await db.execute(query, [userId]);
    return result.affectedRows;
  }

  static async getUnreadCount(userId) {
    const query = `
      SELECT COUNT(*) as unread_count
      FROM notifications
      WHERE user_id = ? AND is_read = false
    `;
    
    const [rows] = await db.execute(query, [userId]);
    return rows[0].unread_count;
  }

  static async deleteOld(daysOld = 30) {
    const query = `
      DELETE FROM notifications
      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    
    const [result] = await db.execute(query, [daysOld]);
    return result.affectedRows;
  }

  static async bulkCreate(notifications) {
    if (!notifications.length) return [];
    
    const query = `
      INSERT INTO notifications (
        id, user_id, issue_id, type, title, message, 
        is_read, sent_via, created_at
      )
      VALUES ?
    `;
    
    const values = notifications.map(n => [
      n.id,
      n.user_id,
      n.issue_id,
      n.type,
      n.title,
      n.message,
      n.is_read || false,
      n.sent_via || 'in-app',
      new Date()
    ]);
    
    await db.execute(query, [values]);
    return notifications.map(n => n.id);
  }
}

module.exports = NotificationModel;
