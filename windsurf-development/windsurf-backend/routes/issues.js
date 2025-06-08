
const express = require('express');
const issueController = require('../controllers/issueController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/rbacMiddleware');
const ValidationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

// Get all issues with filters and pagination
router.get('/', 
  authenticateToken,
  ValidationMiddleware.validatePagination(),
  ValidationMiddleware.handleValidationErrors,
  issueController.getIssues
);

// Get single issue by ID
router.get('/:id', 
  authenticateToken,
  ValidationMiddleware.validateUUIDParam('id'),
  ValidationMiddleware.handleValidationErrors,
  issueController.getIssue
);

// Create new issue
router.post('/', 
  authenticateToken,
  ValidationMiddleware.validateIssue(),
  ValidationMiddleware.handleValidationErrors,
  issueController.createIssue
);

// Update issue (admin/agent only)
router.put('/:id', 
  authenticateToken,
  requirePermission('issues:update'),
  ValidationMiddleware.validateUUIDParam('id'),
  ValidationMiddleware.validateIssueUpdate(),
  ValidationMiddleware.handleValidationErrors,
  issueController.updateIssue
);

// Assign issue (admin/manager only)
router.post('/:id/assign',
  authenticateToken,
  requireRole(['admin', 'manager', 'agent']),
  ValidationMiddleware.validateUUIDParam('id'),
  ValidationMiddleware.handleValidationErrors,
  issueController.assignIssue
);

// Add comment to issue
router.post('/:id/comments',
  authenticateToken,
  ValidationMiddleware.validateUUIDParam('id'),
  ValidationMiddleware.validateComment(),
  ValidationMiddleware.handleValidationErrors,
  issueController.addComment
);

// Add internal comment (admin/agent only)
router.post('/:id/internal-comments',
  authenticateToken,
  requireRole(['admin', 'agent', 'manager']),
  ValidationMiddleware.validateUUIDParam('id'),
  ValidationMiddleware.validateComment(),
  ValidationMiddleware.handleValidationErrors,
  issueController.addInternalComment
);

module.exports = router;
