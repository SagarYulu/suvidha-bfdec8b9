
const { pool } = require('../config/database');
const emailService = require('../services/emailService');
const { validationResult } = require('express-validator');

class NotificationController {
  async getUserPreferences(req, res) {
    try {
      const { userId } = req.params;
      
      const [preferences] = await pool.execute(`
        SELECT * FROM notification_preferences WHERE user_id = ?
      `, [userId]);
      
      if (preferences.length === 0) {
        // Create default preferences
        await pool.execute(`
          INSERT INTO notification_preferences (user_id, email_enabled, on_status_change, on_assignment, on_comment)
          VALUES (?, true, true, true, true)
        `, [userId]);
        
        return res.json({
          success: true,
          data: {
            user_id: userId,
            email_enabled: true,
            on_status_change: true,
            on_assignment: true,
            on_comment: true
          }
        });
      }
      
      res.json({
        success: true,
        data: preferences[0]
      });
    } catch (error) {
      console.error('Error fetching preferences:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateUserPreferences(req, res) {
    try {
      const { userId } = req.params;
      const { email_enabled, on_status_change, on_assignment, on_comment } = req.body;
      
      await pool.execute(`
        UPDATE notification_preferences 
        SET email_enabled = ?, on_status_change = ?, on_assignment = ?, on_comment = ?
        WHERE user_id = ?
      `, [email_enabled, on_status_change, on_assignment, on_comment, userId]);
      
      res.json({
        success: true,
        message: 'Preferences updated successfully'
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async sendNotification(req, res) {
    try {
      const { userId, type, title, message, issueId } = req.body;
      
      // Store notification in database
      await pool.execute(`
        INSERT INTO notifications (user_id, type, title, message, issue_id, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `, [userId, type, title, message, issueId]);
      
      res.json({
        success: true,
        message: 'Notification sent successfully'
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getNotifications(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;
      const offset = (page - 1) * limit;
      
      let query = `
        SELECT * FROM notifications 
        WHERE user_id = ?
      `;
      
      const params = [userId];
      
      if (unreadOnly === 'true') {
        query += ' AND is_read = false';
      }
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
      
      const [notifications] = await pool.execute(query, params);
      
      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      
      await pool.execute(`
        UPDATE notifications 
        SET is_read = true, read_at = NOW()
        WHERE id = ?
      `, [notificationId]);
      
      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const { userId } = req.params;
      
      await pool.execute(`
        UPDATE notifications 
        SET is_read = true, read_at = NOW()
        WHERE user_id = ? AND is_read = false
      `, [userId]);
      
      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new NotificationController();
