
const express = require('express');
const IssueController = require('../controllers/IssueController');
const { authenticateToken, authorizeRoles, checkIssueAccess } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// General issue routes
router.get('/', IssueController.getIssues);
router.post('/', validateRequest(schemas.createIssue), IssueController.createIssue);

// Issue-specific routes with access control
router.get('/:id', checkIssueAccess, IssueController.getIssueById);
router.patch('/:id/status', checkIssueAccess, validateRequest(schemas.updateIssueStatus), IssueController.updateIssueStatus);
router.patch('/:id/assign', authorizeRoles('admin', 'support'), validateRequest(schemas.assignIssue), IssueController.assignIssue);

// Comment routes
router.get('/:id/comments', checkIssueAccess, IssueController.getIssueComments);
router.post('/:id/comments', checkIssueAccess, validateRequest(schemas.addComment), IssueController.addComment);

module.exports = router;
