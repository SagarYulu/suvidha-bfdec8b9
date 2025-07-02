
const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const commentController = require('../controllers/commentController');
const { validationRules, handleValidationErrors } = require('../middlewares/validation');
const { authenticateToken, requireRole, requirePermission } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticateToken);

// Issue CRUD operations
router.get('/', 
  validationRules.pagination, 
  handleValidationErrors, 
  issueController.getAllIssues
);

router.get('/:id', 
  validationRules.uuidParam, 
  handleValidationErrors, 
  issueController.getIssueById
);

router.post('/', 
  validationRules.issueCreation, 
  handleValidationErrors, 
  issueController.createIssue
);

router.put('/:id', 
  validationRules.uuidParam, 
  validationRules.issueUpdate, 
  handleValidationErrors, 
  issueController.updateIssue
);

router.delete('/:id', 
  validationRules.uuidParam, 
  handleValidationErrors, 
  requireRole(['admin', 'manager']), 
  issueController.deleteIssue
);

// Issue status management
router.patch('/:id/status', 
  validationRules.uuidParam, 
  handleValidationErrors, 
  issueController.updateIssueStatus
);

router.patch('/:id/assign', 
  validationRules.uuidParam, 
  handleValidationErrors, 
  requireRole(['admin', 'manager', 'agent']), 
  issueController.assignIssue
);

router.patch('/:id/priority', 
  validationRules.uuidParam, 
  handleValidationErrors, 
  issueController.updateIssuePriority
);

router.post('/:id/reopen', 
  validationRules.uuidParam, 
  handleValidationErrors, 
  issueController.reopenIssue
);

router.post('/:id/escalate', 
  validationRules.uuidParam, 
  handleValidationErrors, 
  requirePermission('escalate_issues'), 
  issueController.escalateIssue
);

// Comments
router.get('/:id/comments', 
  validationRules.uuidParam, 
  handleValidationErrors, 
  commentController.getIssueComments
);

router.post('/:id/comments', 
  validationRules.uuidParam, 
  validationRules.commentCreation, 
  handleValidationErrors, 
  commentController.addComment
);

router.put('/comments/:commentId', 
  validationRules.uuidParam, 
  handleValidationErrors, 
  commentController.updateComment
);

router.delete('/comments/:commentId', 
  validationRules.uuidParam, 
  handleValidationErrors, 
  commentController.deleteComment
);

// Issue analytics and statistics
router.get('/stats/overview', 
  requirePermission('view_analytics'), 
  issueController.getIssueStatistics
);

router.get('/stats/trends', 
  requirePermission('view_analytics'), 
  issueController.getIssueTrends
);

// Audit trail
router.get('/:id/audit', 
  validationRules.uuidParam, 
  handleValidationErrors, 
  issueController.getIssueAuditTrail
);

// Bulk operations
router.post('/bulk/assign', 
  requireRole(['admin', 'manager']), 
  issueController.bulkAssignIssues
);

router.post('/bulk/update-status', 
  requireRole(['admin', 'manager']), 
  issueController.bulkUpdateStatus
);

router.post('/bulk/update-priority', 
  requireRole(['admin', 'manager']), 
  issueController.bulkUpdatePriority
);

module.exports = router;
