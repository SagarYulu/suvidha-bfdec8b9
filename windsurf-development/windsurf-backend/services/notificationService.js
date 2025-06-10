
const { pool } = require('../config/database');

class NotificationService {
  async createNotification(notificationData) {
    try {
      const [result] = await pool.execute(`
        INSERT INTO notifications (
          user_id, type, title, message, data, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `, [
        notificationData.userId,
        notificationData.type,
        notificationData.title,
        notificationData.message,
        JSON.stringify(notificationData.data || {})
      ]);

      return result.insertId;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = options;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE user_id = ?';
      const params = [userId];

      if (unreadOnly) {
        whereClause += ' AND is_read = FALSE';
      }

      const [notifications] = await pool.execute(`
        SELECT * FROM notifications
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), offset]);

      const [countResult] = await pool.execute(`
        SELECT COUNT(*) as total FROM notifications ${whereClause}
      `, params);

      return {
        notifications,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const [result] = await pool.execute(`
        UPDATE notifications 
        SET is_read = TRUE, read_at = NOW() 
        WHERE id = ? AND user_id = ?
      `, [notificationId, userId]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      const [result] = await pool.execute(`
        UPDATE notifications 
        SET is_read = TRUE, read_at = NOW() 
        WHERE user_id = ? AND is_read = FALSE
      `, [userId]);

      return result.affectedRows;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId, userId) {
    try {
      const [result] = await pool.execute(`
        DELETE FROM notifications 
        WHERE id = ? AND user_id = ?
      `, [notificationId, userId]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Notification types for issues
  async notifyIssueAssigned(issueId, assignedToId, assignedById) {
    try {
      const [issue] = await pool.execute(`
        SELECT i.*, e.name as employee_name
        FROM issues i
        JOIN employees e ON i.employee_id = e.id
        WHERE i.id = ?
      `, [issueId]);

      if (issue.length > 0) {
        await this.createNotification({
          userId: assignedToId,
          type: 'issue_assigned',
          title: 'New Issue Assigned',
          message: `Issue "${issue[0].title || issue[0].description.substring(0, 50)}..." has been assigned to you`,
          data: { issueId, assignedById }
        });
      }
    } catch (error) {
      console.error('Error creating issue assignment notification:', error);
    }
  }

  async notifyIssueStatusChanged(issueId, employeeId, newStatus) {
    try {
      const [issue] = await pool.execute(`
        SELECT * FROM issues WHERE id = ?
      `, [issueId]);

      if (issue.length > 0) {
        await this.createNotification({
          userId: employeeId,
          type: 'issue_status_changed',
          title: 'Issue Status Updated',
          message: `Your issue status has been changed to "${newStatus}"`,
          data: { issueId, newStatus }
        });
      }
    } catch (error) {
      console.error('Error creating issue status notification:', error);
    }
  }

  async notifyNewComment(issueId, commentById, targetUserId) {
    try {
      const [issue] = await pool.execute(`
        SELECT i.*, e.name as commenter_name
        FROM issues i, employees e
        WHERE i.id = ? AND e.id = ?
      `, [issueId, commentById]);

      if (issue.length > 0) {
        await this.createNotification({
          userId: targetUserId,
          type: 'new_comment',
          title: 'New Comment Added',
          message: `${issue[0].commenter_name} added a comment to your issue`,
          data: { issueId, commentById }
        });
      }
    } catch (error) {
      console.error('Error creating new comment notification:', error);
    }
  }
}

module.exports = new NotificationService();
