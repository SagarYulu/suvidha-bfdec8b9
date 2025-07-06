
const Notification = require('../models/Notification');
const { HTTP_STATUS } = require('../config/constants');

class NotificationController {
  async getUserNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;
      
      const notifications = await Notification.findByUserId(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        unreadOnly: unreadOnly === 'true'
      });
      
      const unreadCount = await Notification.getUnreadCount(userId);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Notifications retrieved successfully',
        data: {
          notifications,
          unreadCount,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve notifications',
        message: error.message
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;
      
      const notification = await Notification.markAsRead(notificationId, userId);
      
      if (!notification) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Notification not found'
        });
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'Notification marked as read',
        data: notification
      });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to mark notification as read',
        message: error.message
      });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      
      await Notification.markAllAsRead(userId);

      res.status(HTTP_STATUS.OK).json({
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to mark all notifications as read',
        message: error.message
      });
    }
  }

  async createNotification(req, res) {
    try {
      const { user_id, issue_id, content, type = 'info' } = req.body;
      
      const notification = await Notification.create({
        user_id,
        issue_id,
        content,
        type
      });

      res.status(HTTP_STATUS.CREATED).json({
        message: 'Notification created successfully',
        data: notification
      });
    } catch (error) {
      console.error('Create notification error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to create notification',
        message: error.message
      });
    }
  }
}

module.exports = new NotificationController();
