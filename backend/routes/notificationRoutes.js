
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/auth');

// All routes require authentication
router.use(authMiddleware.authenticate);

// Get user notifications
router.get('/', notificationController.getUserNotifications);

// Mark notification as read
router.patch('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

// Create notification (admin only)
router.post('/', authMiddleware.authorize(['admin', 'manager']), notificationController.createNotification);

module.exports = router;
