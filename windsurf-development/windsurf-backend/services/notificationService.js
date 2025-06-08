
const db = require('../config/database');

class NotificationService {
  async getUserNotifications(userId, limit = 50) {
    const [notifications] = await db.execute(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );
    return notifications;
  }

  async getUnreadCount(userId) {
    const [result] = await db.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    return result[0].count;
  }

  async markAsRead(notificationId, userId) {
    await db.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
  }

  async markAllAsRead(userId) {
    await db.execute(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [userId]
    );
  }

  async deleteNotification(notificationId, userId) {
    await db.execute(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
  }

  async createNotification(notificationData) {
    const { user_id, title, message, type = 'info' } = notificationData;
    
    const [result] = await db.execute(
      `INSERT INTO notifications (user_id, title, message, type, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [user_id, title, message, type]
    );
    
    return result.insertId;
  }

  async createBulkNotifications(notifications) {
    if (notifications.length === 0) return;

    const values = notifications.map(n => [n.user_id, n.title, n.message, n.type || 'info']);
    const placeholders = values.map(() => '(?, ?, ?, ?)').join(', ');
    
    await db.execute(
      `INSERT INTO notifications (user_id, title, message, type, created_at) 
       VALUES ${placeholders}`,
      values.flat()
    );
  }
}

module.exports = new NotificationService();
