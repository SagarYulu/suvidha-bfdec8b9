
const express = require('express');
const router = express.Router();
const realtimeController = require('../controllers/realtimeController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Validation middleware
const validateNotification = [
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('type').notEmpty().withMessage('Notification type is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required')
];

const validateBroadcast = [
  body('role').notEmpty().withMessage('Role is required'),
  body('type').notEmpty().withMessage('Message type is required'),
  body('message').notEmpty().withMessage('Message is required')
];

const validateSystemMessage = [
  body('type').notEmpty().withMessage('Message type is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('targetRole').optional().isString()
];

const validateChannelMessage = [
  body('channel').notEmpty().withMessage('Channel is required'),
  body('type').notEmpty().withMessage('Message type is required'),
  body('data').notEmpty().withMessage('Data is required')
];

const validateIssueUpdate = [
  body('issueId').isUUID().withMessage('Valid issue ID is required'),
  body('updateType').notEmpty().withMessage('Update type is required'),
  body('data').notEmpty().withMessage('Update data is required')
];

// Routes

// Get WebSocket connection statistics
router.get('/stats',
  authenticateToken,
  requireRole(['admin', 'manager']),
  realtimeController.getConnectionStats
);

// Send notification to specific user
router.post('/notify/user',
  authenticateToken,
  requireRole(['admin', 'manager', 'agent']),
  validateNotification,
  handleValidationErrors,
  realtimeController.sendNotificationToUser
);

// Broadcast message to users with specific role
router.post('/broadcast/role',
  authenticateToken,
  requireRole(['admin', 'manager']),
  validateBroadcast,
  handleValidationErrors,
  realtimeController.broadcastToRole
);

// Broadcast system message
router.post('/broadcast/system',
  authenticateToken,
  requireRole(['admin']),
  validateSystemMessage,
  handleValidationErrors,
  realtimeController.broadcastSystemMessage
);

// Send message to channel subscribers
router.post('/send/channel',
  authenticateToken,
  requireRole(['admin', 'manager', 'agent']),
  validateChannelMessage,
  handleValidationErrors,
  realtimeController.sendToChannel
);

// Notify issue update
router.post('/notify/issue-update',
  authenticateToken,
  validateIssueUpdate,
  handleValidationErrors,
  realtimeController.notifyIssueUpdate
);

// Get active channels
router.get('/channels',
  authenticateToken,
  requireRole(['admin', 'manager']),
  realtimeController.getActiveChannels
);

// Get connected users info
router.get('/users/connected',
  authenticateToken,
  requireRole(['admin', 'manager']),
  realtimeController.getConnectedUsers
);

// Ping all connected clients
router.post('/ping',
  authenticateToken,
  requireRole(['admin']),
  realtimeController.pingClients
);

// Health check for real-time services
router.get('/health',
  authenticateToken,
  requireRole(['admin']),
  realtimeController.healthCheck
);

module.exports = router;
