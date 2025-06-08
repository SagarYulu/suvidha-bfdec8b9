
const express = require('express');
const router = express.Router();
const escalationController = require('../../controllers/escalationController');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { body, param, query } = require('express-validator');

// Validation middleware
const validateEscalation = [
  param('id').isUUID().withMessage('Invalid issue ID'),
  body('reason').optional().isLength({ min: 5, max: 500 }).withMessage('Reason must be 5-500 characters'),
  body('escalateTo').optional().isIn(['agent', 'manager', 'admin']).withMessage('Invalid escalation target'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority')
];

const validateEscalationRule = [
  param('id').isUUID().withMessage('Invalid rule ID'),
  body('time_threshold_minutes').isInt({ min: 1 }).withMessage('Time threshold must be a positive integer'),
  body('notify_to').isIn(['agent', 'manager', 'admin']).withMessage('Invalid notify_to value'),
  body('is_active').isBoolean().withMessage('is_active must be boolean')
];

// Routes
router.get('/', 
  authenticateToken, 
  requireRole(['admin', 'manager']), 
  escalationController.getEscalations
);

router.post('/:id/escalate', 
  authenticateToken, 
  requireRole(['admin', 'manager']), 
  validateEscalation, 
  escalationController.escalateIssue
);

router.post('/:id/de-escalate', 
  authenticateToken, 
  requireRole(['admin', 'manager']), 
  param('id').isUUID(), 
  escalationController.deEscalateIssue
);

router.get('/rules', 
  authenticateToken, 
  requireRole(['admin']), 
  escalationController.getEscalationRules
);

router.put('/rules/:id', 
  authenticateToken, 
  requireRole(['admin']), 
  validateEscalationRule, 
  escalationController.updateEscalationRule
);

router.get('/metrics', 
  authenticateToken, 
  requireRole(['admin', 'manager']), 
  escalationController.getEscalationMetrics
);

module.exports = router;
