
const notificationService = require('../services/notificationService');

class NotificationController {
  async getUserNotifications(req, res) {
    try {
      const { limit = 50 } = req.query;
      const userId = req.user.id;
      
      const notifications = await notificationService.getUserNotifications(userId, parseInt(limit));
      
      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      console.error('Get user notifications error:', error);
      res.status(500).json({
        error: 'Failed to fetch notifications',
        message: error.message
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      await notificationService.markAsRead(id, userId);
      
      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({
        error: 'Failed to mark notification as read',
        message: error.message
      });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      
      await notificationService.markAllAsRead(userId);
      
      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({
        error: 'Failed to mark all notifications as read',
        message: error.message
      });
    }
  }

  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      
      const count = await notificationService.getUnreadCount(userId);
      
      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({
        error: 'Failed to fetch unread count',
        message: error.message
      });
    }
  }

  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      await notificationService.deleteNotification(id, userId);
      
      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({
        error: 'Failed to delete notification',
        message: error.message
      });
    }
  }
}

module.exports = new NotificationController();
