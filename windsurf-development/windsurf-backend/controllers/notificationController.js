
const notificationService = require('../services/notificationService');

class NotificationController {
  async getUserNotifications(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;

      const result = await notificationService.getUserNotifications(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        unreadOnly: unreadOnly === 'true'
      });

      res.json({
        success: true,
        data: result
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
      const { notificationId } = req.params;
      const userId = req.user.id; // From auth middleware

      const success = await notificationService.markAsRead(notificationId, userId);
      
      if (!success) {
        return res.status(404).json({ error: 'Notification not found' });
      }

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
      const { userId } = req.params;

      const count = await notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: `${count} notifications marked as read`
      });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({
        error: 'Failed to mark all notifications as read',
        message: error.message
      });
    }
  }

  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id; // From auth middleware

      const success = await notificationService.deleteNotification(notificationId, userId);
      
      if (!success) {
        return res.status(404).json({ error: 'Notification not found' });
      }

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
