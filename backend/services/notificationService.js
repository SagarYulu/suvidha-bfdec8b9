
const { getPool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class NotificationService {
  static async createNotification(issueId, userId, content, type = 'info') {
    const pool = getPool();
    const notificationId = uuidv4();
    
    try {
      await pool.execute(
        `INSERT INTO issue_notifications 
         (id, issue_id, user_id, content, notification_type, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [notificationId, issueId, userId, content, type]
      );
      
      return notificationId;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async getNotificationsByUser(userId, limit = 20, offset = 0) {
    const pool = getPool();
    
    try {
      const [notifications] = await pool.execute(
        `SELECT n.*, i.title as issue_title 
         FROM issue_notifications n
         LEFT JOIN issues i ON n.issue_id = i.id
         WHERE n.user_id = ?
         ORDER BY n.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId, userId) {
    const pool = getPool();
    
    try {
      await pool.execute(
        `UPDATE issue_notifications 
         SET is_read = true 
         WHERE id = ? AND user_id = ?`,
        [notificationId, userId]
      );
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId) {
    const pool = getPool();
    
    try {
      await pool.execute(
        `UPDATE issue_notifications 
         SET is_read = true 
         WHERE user_id = ? AND is_read = false`,
        [userId]
      );
      
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  static async getUnreadCount(userId) {
    const pool = getPool();
    
    try {
      const [result] = await pool.execute(
        `SELECT COUNT(*) as count 
         FROM issue_notifications 
         WHERE user_id = ? AND is_read = false`,
        [userId]
      );
      
      return result[0].count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Real-time notification methods
  static async notifyIssueStatusChange(issueId, oldStatus, newStatus, changedBy) {
    try {
      // Get issue details
      const pool = getPool();
      const [issues] = await pool.execute(
        `SELECT i.*, e.emp_name 
         FROM issues i 
         LEFT JOIN employees e ON i.employee_id = e.id 
         WHERE i.id = ?`,
        [issueId]
      );
      
      if (issues.length === 0) return;
      
      const issue = issues[0];
      const content = `Issue "${issue.title}" status changed from ${oldStatus} to ${newStatus}`;
      
      // Notify relevant users
      const usersToNotify = [issue.created_by, issue.assigned_to].filter(Boolean);
      
      for (const userId of usersToNotify) {
        if (userId !== changedBy) {
          await this.createNotification(issueId, userId, content, 'status_change');
        }
      }
    } catch (error) {
      console.error('Error creating status change notification:', error);
    }
  }

  static async notifyNewComment(issueId, commentId, commentBy) {
    try {
      const pool = getPool();
      const [issues] = await pool.execute(
        `SELECT i.*, e.emp_name 
         FROM issues i 
         LEFT JOIN employees e ON i.employee_id = e.id 
         WHERE i.id = ?`,
        [issueId]
      );
      
      if (issues.length === 0) return;
      
      const issue = issues[0];
      const content = `New comment added to issue "${issue.title}"`;
      
      // Notify relevant users
      const usersToNotify = [issue.created_by, issue.assigned_to].filter(Boolean);
      
      for (const userId of usersToNotify) {
        if (userId !== commentBy) {
          await this.createNotification(issueId, userId, content, 'new_comment');
        }
      }
    } catch (error) {
      console.error('Error creating comment notification:', error);
    }
  }
}

module.exports = NotificationService;
