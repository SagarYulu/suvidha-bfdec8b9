
const express = require('express');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/:userId', authMiddleware.authenticateAdmin, notificationController.getUserNotifications);

// Mark notification as read
router.post('/:notificationId/read', authMiddleware.authenticateAdmin, notificationController.markAsRead);

// Mark all notifications as read
router.post('/read-all/:userId', authMiddleware.authenticateAdmin, notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', authMiddleware.authenticateAdmin, notificationController.deleteNotification);

module.exports = router;
