
const express = require('express');
const mobileController = require('../controllers/mobileController');
const { body } = require('express-validator');

const router = express.Router();

// Validation middleware
const createIssueValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('employee_id').notEmpty().withMessage('Employee ID is required'),
  body('category').optional(),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
];

const addCommentValidation = [
  body('issue_id').notEmpty().withMessage('Issue ID is required'),
  body('content').notEmpty().withMessage('Comment content is required'),
  body('employee_id').notEmpty().withMessage('Employee ID is required')
];

// Issue routes
router.get('/issues/:employeeId', mobileController.getEmployeeIssues);
router.get('/issue/:id', mobileController.getIssueDetails);
router.post('/issues', createIssueValidation, mobileController.createIssue);

// Comment routes
router.post('/comments', addCommentValidation, mobileController.addComment);

// Profile routes
router.get('/profile/:employeeId', mobileController.getProfile);
router.put('/profile/:employeeId', mobileController.updateProfile);

// Dashboard stats
router.get('/dashboard-stats', mobileController.getDashboardStats);

module.exports = router;
