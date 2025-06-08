
const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notificationController');
const { authenticateToken } = require('../../middleware/auth');
const { body, param, query } = require('express-validator');

// Validation middleware
const validatePreferences = [
  body('on_assignment').optional().isBoolean().withMessage('on_assignment must be boolean'),
  body('on_resolution').optional().isBoolean().withMessage('on_resolution must be boolean'),
  body('on_comment').optional().isBoolean().withMessage('on_comment must be boolean'),
  body('on_escalation').optional().isBoolean().withMessage('on_escalation must be boolean'),
  body('on_status_change').optional().isBoolean().withMessage('on_status_change must be boolean'),
  body('email_enabled').optional().isBoolean().withMessage('email_enabled must be boolean'),
  body('push_enabled').optional().isBoolean().withMessage('push_enabled must be boolean')
];

const validateNotification = [
  body('userId').isUUID().withMessage('Invalid user ID'),
  body('type').isIn(['assignment', 'status_change', 'comment', 'escalation', 'resolution']).withMessage('Invalid notification type'),
  body('title').isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('message').isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters'),
  body('issueId').optional().isUUID().withMessage('Invalid issue ID'),
  body('priority').optional().isIn(['low', 'normal', 'high']).withMessage('Invalid priority')
];

// Routes

// Get user notification preferences
router.get('/preferences/:userId', 
  authenticateToken, 
  param('userId').isUUID(), 
  notificationController.getUserPreferences
);

// Update user notification preferences
router.put('/preferences/:userId', 
  authenticateToken, 
  param('userId').isUUID(), 
  validatePreferences, 
  notificationController.updateUserPreferences
);

// Send notification
router.post('/send', 
  authenticateToken, 
  validateNotification, 
  notificationController.sendNotification
);

// Get user notifications
router.get('/:userId', 
  authenticateToken, 
  param('userId').isUUID(), 
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('unreadOnly').optional().isBoolean().withMessage('unreadOnly must be boolean'),
  notificationController.getNotifications
);

// Mark notification as read
router.put('/:notificationId/read', 
  authenticateToken, 
  param('notificationId').isUUID(), 
  notificationController.markAsRead
);

// Mark all notifications as read for user
router.put('/:userId/read-all', 
  authenticateToken, 
  param('userId').isUUID(), 
  notificationController.markAllAsRead
);

module.exports = router;
