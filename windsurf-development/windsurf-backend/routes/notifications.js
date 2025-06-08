
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Get user notifications
router.get('/', auth, notificationController.getUserNotifications);

// Get unread count
router.get('/unread-count', auth, notificationController.getUnreadCount);

// Mark notification as read
router.put('/:id/read', auth, notificationController.markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', auth, notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;
