
const Notification = require('../models/Notification');
const { getPool } = require('../config/database');

class NotificationService {
  static async createIssueNotification(issueId, userId, type, content) {
    try {
      const notification = await Notification.create({
        user_id: userId,
        issue_id: issueId,
        type: type,
        content: content
      });

      // Here you would integrate with real-time service (WebSocket, SSE, etc.)
      this.sendRealTimeNotification(userId, notification);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async notifyIssueStatusChange(issueId, newStatus, assignedTo, reportedBy) {
    const content = `Issue status updated to ${newStatus}`;
    
    // Notify assigned user
    if (assignedTo) {
      await this.createIssueNotification(issueId, assignedTo, 'status_update', content);
    }

    // Notify reporter
    if (reportedBy && reportedBy !== assignedTo) {
      await this.createIssueNotification(issueId, reportedBy, 'status_update', content);
    }
  }

  static async notifyIssueAssignment(issueId, assignedTo, assignedBy) {
    const content = 'A new issue has been assigned to you';
    await this.createIssueNotification(issueId, assignedTo, 'assignment', content);
  }

  static async notifyIssueEscalation(issueId, escalatedTo, escalationReason) {
    const content = `Issue escalated: ${escalationReason}`;
    await this.createIssueNotification(issueId, escalatedTo, 'escalation', content);
  }

  static async notifyNewComment(issueId, commentAuthor, issueReporter, assignedTo) {
    const content = 'New comment added to your issue';
    
    // Notify issue reporter
    if (issueReporter && issueReporter !== commentAuthor) {
      await this.createIssueNotification(issueId, issueReporter, 'comment', content);
    }

    // Notify assigned user
    if (assignedTo && assignedTo !== commentAuthor && assignedTo !== issueReporter) {
      await this.createIssueNotification(issueId, assignedTo, 'comment', content);
    }
  }

  static async notifyFeedbackReceived(issueId, assignedTo) {
    const content = 'Feedback received for your resolved issue';
    if (assignedTo) {
      await this.createIssueNotification(issueId, assignedTo, 'feedback', content);
    }
  }

  static async sendBulkNotifications(userIds, type, content, issueId = null) {
    const notifications = [];
    
    for (const userId of userIds) {
      const notification = await this.createIssueNotification(issueId, userId, type, content);
      notifications.push(notification);
    }

    return notifications;
  }

  static async sendRealTimeNotification(userId, notification) {
    // This would integrate with your real-time system
    // For now, we'll just log it
    console.log(`Real-time notification for user ${userId}:`, notification);
    
    // In a real implementation, you might:
    // - Send via WebSocket
    // - Push to message queue
    // - Send via Server-Sent Events
    // - Integrate with push notification service
  }

  static async getNotificationPreferences(userId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM user_notification_preferences WHERE user_id = ?',
      [userId]
    );
    
    return rows[0] || {
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      notification_types: ['assignment', 'status_update', 'comment', 'escalation']
    };
  }

  static async updateNotificationPreferences(userId, preferences) {
    const pool = getPool();
    
    await pool.execute(
      `INSERT INTO user_notification_preferences 
       (user_id, email_notifications, push_notifications, sms_notifications, notification_types, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
       email_notifications = VALUES(email_notifications),
       push_notifications = VALUES(push_notifications),
       sms_notifications = VALUES(sms_notifications),
       notification_types = VALUES(notification_types),
       updated_at = NOW()`,
      [
        userId,
        preferences.email_notifications,
        preferences.push_notifications,
        preferences.sms_notifications,
        JSON.stringify(preferences.notification_types)
      ]
    );
  }

  static async cleanupOldNotifications(daysToKeep = 30) {
    const pool = getPool();
    
    const [result] = await pool.execute(
      'DELETE FROM issue_notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [daysToKeep]
    );

    console.log(`Cleaned up ${result.affectedRows} old notifications`);
    return result.affectedRows;
  }
}

module.exports = NotificationService;
