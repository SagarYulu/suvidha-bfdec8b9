
const express = require('express');
const issueController = require('../controllers/issueController');
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { validateIssue, validateComment, handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Get all issues with filters and pagination
router.get('/', authenticateToken, issueController.getIssues);

// Get single issue by ID
router.get('/:id', authenticateToken, issueController.getIssue);

// Create new issue
router.post('/', authenticateToken, validateIssue, handleValidationErrors, issueController.createIssue);

// Update issue (admin/agent only)
router.put('/:id', authenticateToken, requireRole(['admin', 'manager', 'agent']), issueController.updateIssue);

// Assign issue (admin/manager only)
router.post('/:id/assign', authenticateToken, requireRole(['admin', 'manager', 'agent']), issueController.assignIssue);

// Add comment to issue
router.post('/:id/comments', authenticateToken, validateComment, handleValidationErrors, issueController.addComment);

// Add internal comment (admin/agent only)
router.post('/:id/internal-comments', authenticateToken, requireRole(['admin', 'agent', 'manager']), validateComment, handleValidationErrors, issueController.addInternalComment);

// Get issue audit trail
router.get('/:id/audit-trail', authenticateToken, issueController.getIssueAuditTrail);

module.exports = router;
