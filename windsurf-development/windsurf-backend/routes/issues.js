
const express = require('express');
const issueController = require('../controllers/issueController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

const issueValidation = [
  body('typeId').notEmpty().withMessage('Type ID is required'),
  body('subTypeId').notEmpty().withMessage('Sub-type ID is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('employeeUuid').notEmpty().withMessage('Employee UUID is required')
];

// Get all issues
router.get('/', 
  authenticateToken,
  issueController.getIssues
);

// Get single issue
router.get('/:id', 
  authenticateToken,
  issueController.getIssue
);

// Create new issue
router.post('/', 
  authenticateToken,
  issueValidation,
  issueController.createIssue
);

// Update issue
router.put('/:id', 
  authenticateToken,
  issueController.updateIssue
);

// Assign issue
router.post('/:id/assign',
  authenticateToken,
  requireRole(['admin', 'manager']),
  issueController.assignIssue
);

// Add comment to issue
router.post('/:id/comments',
  authenticateToken,
  body('content').notEmpty().withMessage('Comment content is required'),
  issueController.addComment
);

// Add internal comment to issue
router.post('/:id/internal-comments',
  authenticateToken,
  requireRole(['admin', 'manager', 'agent']),
  body('content').notEmpty().withMessage('Comment content is required'),
  issueController.addInternalComment
);

module.exports = router;
