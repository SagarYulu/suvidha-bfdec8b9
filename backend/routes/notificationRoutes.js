
const express = require('express');
const router = express.Router();
const NotificationService = require('../services/notificationService');
const { authenticateToken } = require('../middlewares/auth');
const { HTTP_STATUS } = require('../config/constants');

// All routes require authentication
router.use(authenticateToken);

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const notifications = await NotificationService.getNotificationsByUser(
      req.user.id, 
      parseInt(limit), 
      offset
    );
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: notifications
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to get notifications',
      message: error.message
    });
  }
});

// Get unread count
router.get('/unread-count', async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user.id);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Unread count retrieved',
      data: { count }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to get unread count',
      message: error.message
    });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    await NotificationService.markAsRead(req.params.id, req.user.id);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to mark notification as read',
      message: error.message
    });
  }
});

// Mark all notifications as read
router.patch('/read-all', async (req, res) => {
  try {
    await NotificationService.markAllAsRead(req.user.id);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to mark all notifications as read',
      message: error.message
    });
  }
});

module.exports = router;
