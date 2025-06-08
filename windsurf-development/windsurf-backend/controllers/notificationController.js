
const { pool } = require('../config/database');
const emailService = require('../services/actualEmailService');
const { validationResult } = require('express-validator');

class NotificationController {
  async getUserPreferences(req, res) {
    try {
      const { userId } = req.params;
      
      const [preferences] = await pool.execute(`
        SELECT * FROM notification_preferences WHERE user_id = ?
      `, [userId]);

      if (preferences.length === 0) {
        // Create default preferences if none exist
        await pool.execute(`
          INSERT INTO notification_preferences (id, user_id) VALUES (UUID(), ?)
        `, [userId]);

        const [newPreferences] = await pool.execute(`
          SELECT * FROM notification_preferences WHERE user_id = ?
        `, [userId]);

        return res.json({
          success: true,
          data: newPreferences[0]
        });
      }

      res.json({
        success: true,
        data: preferences[0]
      });
    } catch (error) {
      console.error('Get user preferences error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch notification preferences'
      });
    }
  }

  async updateUserPreferences(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { userId } = req.params;
      const {
        on_assignment,
        on_resolution,
        on_comment,
        on_escalation,
        on_status_change,
        email_enabled,
        push_enabled
      } = req.body;

      await pool.execute(`
        UPDATE notification_preferences 
        SET on_assignment = ?, on_resolution = ?, on_comment = ?, 
            on_escalation = ?, on_status_change = ?, email_enabled = ?, 
            push_enabled = ?, updated_at = NOW()
        WHERE user_id = ?
      `, [
        on_assignment, on_resolution, on_comment,
        on_escalation, on_status_change, email_enabled,
        push_enabled, userId
      ]);

      const [updatedPreferences] = await pool.execute(`
        SELECT * FROM notification_preferences WHERE user_id = ?
      `, [userId]);

      res.json({
        success: true,
        data: updatedPreferences[0],
        message: 'Notification preferences updated successfully'
      });
    } catch (error) {
      console.error('Update user preferences error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update notification preferences'
      });
    }
  }

  async sendNotification(req, res) {
    try {
      const { userId, type, title, message, issueId, priority = 'normal' } = req.body;
      
      // Check user preferences
      const [preferences] = await pool.execute(`
        SELECT * FROM notification_preferences WHERE user_id = ?
      `, [userId]);

      if (preferences.length === 0 || !preferences[0].email_enabled) {
        return res.json({
          success: true,
          message: 'Notification skipped - user preferences disabled'
        });
      }

      // Get user email
      const [user] = await pool.execute(`
        SELECT email, name FROM dashboard_users WHERE id = ?
        UNION
        SELECT email, name FROM employees WHERE id = ?
      `, [userId, userId]);

      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Send email notification
      const emailData = {
        to: user[0].email,
        name: user[0].name,
        title,
        message,
        issueId,
        type,
        priority
      };

      await emailService.sendNotificationEmail(emailData);

      // Store notification in database
      await pool.execute(`
        INSERT INTO issue_notifications (id, issue_id, user_id, content, created_at)
        VALUES (UUID(), ?, ?, ?, NOW())
      `, [issueId || null, userId, message]);

      res.json({
        success: true,
        message: 'Notification sent successfully'
      });
    } catch (error) {
      console.error('Send notification error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send notification'
      });
    }
  }

  async getNotifications(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE user_id = ?';
      const params = [userId];

      if (unreadOnly === 'true') {
        whereClause += ' AND is_read = FALSE';
      }

      const [notifications] = await pool.execute(`
        SELECT 
          in_.*,
          i.description as issue_description
        FROM issue_notifications in_
        LEFT JOIN issues i ON in_.issue_id = i.id
        ${whereClause}
        ORDER BY in_.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, limit, offset]);

      const [countResult] = await pool.execute(`
        SELECT COUNT(*) as total FROM issue_notifications ${whereClause}
      `, params);

      res.json({
        success: true,
        data: notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch notifications'
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      
      await pool.execute(`
        UPDATE issue_notifications 
        SET is_read = TRUE 
        WHERE id = ?
      `, [notificationId]);

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark notification as read'
      });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const { userId } = req.params;
      
      const [result] = await pool.execute(`
        UPDATE issue_notifications 
        SET is_read = TRUE 
        WHERE user_id = ? AND is_read = FALSE
      `, [userId]);

      res.json({
        success: true,
        message: `${result.affectedRows} notifications marked as read`
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark all notifications as read'
      });
    }
  }

  async triggerNotification(issueId, eventType, userId, additionalData = {}) {
    try {
      // This method is called internally by other services
      const [issue] = await pool.execute(`
        SELECT i.*, e.name as employee_name, e.email as employee_email
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE i.id = ?
      `, [issueId]);

      if (issue.length === 0) return;

      const issueData = issue[0];
      let title, message;

      switch (eventType) {
        case 'assignment':
          title = 'Issue Assigned';
          message = `Issue "${issueData.description.substring(0, 50)}..." has been assigned to you`;
          break;
        case 'status_change':
          title = 'Status Updated';
          message = `Your issue status has been changed to "${additionalData.newStatus}"`;
          break;
        case 'comment':
          title = 'New Comment';
          message = `A new comment has been added to your issue`;
          break;
        case 'escalation':
          title = 'Issue Escalated';
          message = `Your issue has been escalated for priority handling`;
          break;
        case 'resolution':
          title = 'Issue Resolved';
          message = `Your issue has been resolved. Please provide feedback`;
          break;
        default:
          title = 'Issue Update';
          message = 'Your issue has been updated';
      }

      // Send notification
      await this.sendNotification({
        body: {
          userId,
          type: eventType,
          title,
          message,
          issueId,
          priority: issueData.priority
        }
      }, {
        json: () => {} // Mock response object
      });

    } catch (error) {
      console.error('Trigger notification error:', error);
    }
  }
}

module.exports = new NotificationController();
