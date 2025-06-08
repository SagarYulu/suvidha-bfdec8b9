
const express = require('express');
const router = express.Router();
const issueController = require('../../controllers/issueController');
const { authenticateToken } = require('../../middleware/auth');
const { body, param, query } = require('express-validator');

// Validation middleware
const validateCreateIssue = [
  body('employee_uuid').notEmpty().withMessage('Employee UUID is required'),
  body('type_id').notEmpty().withMessage('Issue type is required'),
  body('sub_type_id').notEmpty().withMessage('Issue sub-type is required'),
  body('description').notEmpty().withMessage('Description is required').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority')
];

const validateUpdateIssue = [
  param('id').isUUID().withMessage('Invalid issue ID'),
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority')
];

const validateComment = [
  param('id').isUUID().withMessage('Invalid issue ID'),
  body('content').notEmpty().withMessage('Comment content is required').isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
];

// Routes
router.get('/', authenticateToken, issueController.getIssues);
router.get('/:id', authenticateToken, param('id').isUUID(), issueController.getIssue);
router.post('/', authenticateToken, validateCreateIssue, issueController.createIssue);
router.put('/:id', authenticateToken, validateUpdateIssue, issueController.updateIssue);
router.post('/:id/assign', authenticateToken, param('id').isUUID(), body('assignedTo').notEmpty(), issueController.assignIssue);
router.post('/:id/comments', authenticateToken, validateComment, issueController.addComment);
router.post('/:id/internal-comments', authenticateToken, validateComment, issueController.addInternalComment);
router.get('/:id/audit-trail', authenticateToken, param('id').isUUID(), issueController.getIssueAuditTrail);

module.exports = router;
