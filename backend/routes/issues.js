const express = require('express');
const router = express.Router();
const {
  getIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  getMyAssignedIssues,
  getIssueStats,
  assignIssue,
  closeIssue
} = require('../controllers/issueController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Get all issues (protected)
router.get('/', authenticateToken, getIssues);

// Get issue statistics (admin only)
router.get('/stats', authenticateToken, authorizeRoles('admin'), getIssueStats);

// Get my assigned issues (for current user)
router.get('/my-assigned', authenticateToken, getMyAssignedIssues);

// Get issue by ID (protected)
router.get('/:id', authenticateToken, getIssueById);

// Create new issue (authenticated users)
router.post('/', authenticateToken, createIssue);

// Update issue (admin or assigned user)
router.put('/:id', authenticateToken, updateIssue);

// Assign issue (admin only)
router.put('/:id/assign', authenticateToken, authorizeRoles('admin'), assignIssue);

// Close issue (admin or assigned user)
router.put('/:id/close', authenticateToken, closeIssue);

// Delete issue (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteIssue);

module.exports = router;