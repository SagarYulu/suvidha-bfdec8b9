
const express = require('express');
const router = express.Router();
const escalationController = require('../controllers/escalationController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Validation middleware
const validateEscalation = [
  body('issue_id').isUUID().withMessage('Valid issue ID is required'),
  body('escalated_to').isUUID().withMessage('Valid escalated_to user ID is required'),
  body('reason').notEmpty().withMessage('Escalation reason is required').isLength({ max: 500 }).withMessage('Reason must not exceed 500 characters'),
  body('escalation_type').optional().isIn(['manual', 'auto_critical', 'auto_breach']).withMessage('Invalid escalation type')
];

const validateEscalationResolution = [
  param('id').isUUID().withMessage('Valid escalation ID is required'),
  body('resolution').optional().isLength({ max: 1000 }).withMessage('Resolution must not exceed 1000 characters')
];

// Routes

// Create escalation (managers and admins only)
router.post('/',
  authenticateToken,
  requireRole(['admin', 'manager']),
  validateEscalation,
  handleValidationErrors,
  escalationController.createEscalation
);

// Get specific escalation
router.get('/:id',
  authenticateToken,
  param('id').isUUID(),
  handleValidationErrors,
  escalationController.getEscalation
);

// Get escalations for a specific issue
router.get('/issue/:issue_id',
  authenticateToken,
  param('issue_id').isUUID(),
  handleValidationErrors,
  escalationController.getIssueEscalations
);

// Get pending escalations
router.get('/status/pending',
  authenticateToken,
  requireRole(['admin', 'manager']),
  escalationController.getPendingEscalations
);

// Get escalation statistics
router.get('/stats/summary',
  authenticateToken,
  requireRole(['admin', 'manager']),
  escalationController.getEscalationStats
);

// Get user's escalations (created by or assigned to)
router.get('/user/me',
  authenticateToken,
  escalationController.getMyEscalations
);

// Resolve escalation
router.post('/:id/resolve',
  authenticateToken,
  requireRole(['admin', 'manager']),
  validateEscalationResolution,
  handleValidationErrors,
  escalationController.resolveEscalation
);

// Auto-escalate an issue
router.post('/auto-escalate/:issue_id',
  authenticateToken,
  requireRole(['admin', 'manager']),
  param('issue_id').isUUID(),
  body('escalation_type').optional().isIn(['manual', 'auto_critical', 'auto_breach']),
  body('reason').optional().isLength({ max: 500 }),
  handleValidationErrors,
  escalationController.autoEscalateIssue
);

// Trigger auto-escalation process (admin only)
router.post('/process/auto-escalations',
  authenticateToken,
  requireRole(['admin']),
  escalationController.processAutoEscalations
);

module.exports = router;
