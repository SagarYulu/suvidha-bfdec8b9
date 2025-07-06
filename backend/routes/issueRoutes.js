
const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const commentController = require('../controllers/commentController');
const { validationRules, handleValidationErrors } = require('../middlewares/validation');
const { authenticateToken, requireRole, requirePermission } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticateToken);

// Issue CRUD operations
router.get('/', issueController.getAllIssues);
router.get('/stats', issueController.getIssueStatistics);
router.get('/:id', issueController.getIssueById);
router.post('/', issueController.createIssue);
router.put('/:id', issueController.updateIssue);
router.delete('/:id', requireRole(['admin', 'manager']), issueController.deleteIssue);

// Issue status management
router.patch('/:id/status', issueController.updateIssueStatus);
router.patch('/:id/assign', requireRole(['admin', 'manager', 'agent']), issueController.assignIssue);
router.post('/:id/reopen', issueController.reopenIssue);
router.post('/:id/escalate', requirePermission('escalate_issues'), issueController.escalateIssue);

// Comments
router.get('/:id/comments', commentController.getIssueComments);
router.post('/:id/comments', commentController.addComment);
router.put('/comments/:commentId', commentController.updateComment);
router.delete('/comments/:commentId', commentController.deleteComment);

module.exports = router;
