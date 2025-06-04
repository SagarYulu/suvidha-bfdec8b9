
const express = require('express');
const issueController = require('../controllers/issueController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

// Validation middleware
const issueValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status')
];

// Get all issues with filtering and pagination
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
  requireRole(['admin', 'manager', 'support']),
  issueController.updateIssue
);

// Delete issue
router.delete('/:id', 
  authenticateToken, 
  requireRole(['admin', 'manager']), 
  issueController.deleteIssue
);

// Assign issue
router.post('/:id/assign', 
  authenticateToken, 
  requireRole(['admin', 'manager', 'support']),
  body('assignedTo').notEmpty().withMessage('Assigned to is required'),
  issueController.assignIssue
);

module.exports = router;
