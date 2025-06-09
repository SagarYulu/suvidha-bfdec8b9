
const NotificationModel = require('../models/Notification');
const EmailService = require('./emailService');
const { v4: uuidv4 } = require('uuid');

class NotificationService {
  static async createNotification(notificationData) {
    try {
      const notificationId = uuidv4();
      
      const notification = await NotificationModel.create({
        id: notificationId,
        user_id: notificationData.user_id,
        issue_id: notificationData.issue_id,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        is_read: false,
        sent_via: notificationData.sent_via || 'in-app'
      });

      // Emit real-time notification if WebSocket is available
      if (global.wss) {
        this.broadcastNotification(notificationData.user_id, notification);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async createBulkNotifications(notifications) {
    try {
      const notificationsWithIds = notifications.map(n => ({
        ...n,
        id: uuidv4(),
        is_read: false,
        sent_via: n.sent_via || 'in-app'
      }));

      await NotificationModel.bulkCreate(notificationsWithIds);

      // Broadcast to all users if WebSocket is available
      if (global.wss) {
        notificationsWithIds.forEach(notification => {
          this.broadcastNotification(notification.user_id, notification);
        });
      }

      return notificationsWithIds;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  static async getUserNotifications(userId, filters = {}) {
    try {
      return await NotificationModel.findByUserId(userId, filters);
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  static async markAsRead(notificationId) {
    try {
      return await NotificationModel.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId) {
    try {
      return await NotificationModel.markAllAsRead(userId);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  static async getUnreadCount(userId) {
    try {
      return await NotificationModel.getUnreadCount(userId);
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  static broadcastNotification(userId, notification) {
    if (!global.wss) return;

    global.wss.clients.forEach(client => {
      if (client.readyState === 1 && client.userId === userId) { // WebSocket.OPEN
        client.send(JSON.stringify({
          type: 'notification',
          data: notification
        }));
      }
    });
  }

  static async notifyIssueCreated(issue, assignedUser) {
    try {
      if (!assignedUser) return;

      await this.createNotification({
        user_id: assignedUser.id,
        issue_id: issue.id,
        type: 'issue_assigned',
        title: 'New Issue Assigned',
        message: `A new issue has been assigned to you: ${issue.description.substring(0, 100)}...`
      });

      // Send email notification
      await EmailService.sendIssueCreatedEmail(issue, assignedUser);
    } catch (error) {
      console.error('Error notifying issue created:', error);
    }
  }

  static async notifyStatusUpdate(issue, oldStatus, newStatus, updatedBy) {
    try {
      // Notify issue creator
      await this.createNotification({
        user_id: issue.employee_uuid,
        issue_id: issue.id,
        type: 'status_update',
        title: 'Issue Status Updated',
        message: `Your issue status has been updated from ${oldStatus} to ${newStatus}`
      });

      // Send email notification
      await EmailService.sendIssueStatusUpdateEmail(issue, oldStatus, newStatus, updatedBy);

      // Notify assigned user if different from updater
      if (issue.assigned_to && issue.assigned_to !== updatedBy.id) {
        await this.createNotification({
          user_id: issue.assigned_to,
          issue_id: issue.id,
          type: 'status_update',
          title: 'Assigned Issue Status Updated',
          message: `Status of assigned issue has been updated to ${newStatus}`
        });
      }
    } catch (error) {
      console.error('Error notifying status update:', error);
    }
  }

  static async notifyCommentAdded(comment, issue) {
    try {
      // Get all stakeholders (creator, assignee, commenters)
      const stakeholders = new Set();
      
      // Add issue creator
      stakeholders.add(issue.employee_uuid);
      
      // Add assigned user
      if (issue.assigned_to) {
        stakeholders.add(issue.assigned_to);
      }

      // Add previous commenters
      const comments = await this.getIssueComments(issue.id);
      comments.forEach(c => stakeholders.add(c.user_id));

      // Remove the comment author
      stakeholders.delete(comment.user_id);

      // Create notifications for all stakeholders
      const notifications = Array.from(stakeholders).map(userId => ({
        user_id: userId,
        issue_id: issue.id,
        type: 'comment_added',
        title: 'New Comment Added',
        message: `A new comment has been added to issue: ${comment.content.substring(0, 100)}...`
      }));

      await this.createBulkNotifications(notifications);

      // Send email notification
      await EmailService.sendCommentNotificationEmail(comment, issue);
    } catch (error) {
      console.error('Error notifying comment added:', error);
    }
  }

  static async notifyEscalation(escalation, issue) {
    try {
      // Notify escalated user
      await this.createNotification({
        user_id: escalation.escalated_to,
        issue_id: issue.id,
        type: 'escalation',
        title: 'Issue Escalated to You',
        message: `An issue has been escalated to you: ${escalation.reason}`
      });

      // Notify original assignee if different
      if (escalation.escalated_from && escalation.escalated_from !== escalation.escalated_to) {
        await this.createNotification({
          user_id: escalation.escalated_from,
          issue_id: issue.id,
          type: 'escalation',
          title: 'Issue Escalated',
          message: `Your assigned issue has been escalated: ${escalation.reason}`
        });
      }

      // Send email notification
      await EmailService.sendEscalationEmail(escalation, issue);
    } catch (error) {
      console.error('Error notifying escalation:', error);
    }
  }

  static async notifyTATWarning(issue, tatInfo) {
    try {
      const notifications = [];

      // Notify assigned user
      if (issue.assigned_to) {
        notifications.push({
          user_id: issue.assigned_to,
          issue_id: issue.id,
          type: 'tat_warning',
          title: 'TAT Warning',
          message: `Issue is approaching TAT deadline (${tatInfo.days_elapsed} days elapsed)`
        });
      }

      // Notify managers for critical TAT issues
      if (tatInfo.status === 'critical' || tatInfo.status === 'breach') {
        const UserModel = require('../models/User');
        const managers = await UserModel.findByRole('manager');
        
        managers.forEach(manager => {
          notifications.push({
            user_id: manager.id,
            issue_id: issue.id,
            type: 'tat_warning',
            title: 'Critical TAT Warning',
            message: `Issue ${issue.id} has breached TAT (${tatInfo.days_elapsed} days)`
          });
        });
      }

      await this.createBulkNotifications(notifications);

      // Send email warnings
      await EmailService.sendTATWarningEmail(issue, tatInfo);
    } catch (error) {
      console.error('Error notifying TAT warning:', error);
    }
  }

  static async cleanupOldNotifications() {
    try {
      const deletedCount = await NotificationModel.deleteOld(30); // Delete notifications older than 30 days
      console.log(`Cleaned up ${deletedCount} old notifications`);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      return 0;
    }
  }

  static async getIssueComments(issueId) {
    // Helper method to get issue comments
    const CommentModel = require('../models/Comment');
    return await CommentModel.findByIssueId(issueId);
  }
}

module.exports = NotificationService;
