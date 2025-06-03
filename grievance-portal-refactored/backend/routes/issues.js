
const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const issuesController = require('../controllers/issuesController');
const { authenticateToken, authorizeRoles, checkIssueAccess } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  }
});

// Get all issues (with filtering)
router.get('/', authenticateToken, issuesController.getIssues);

// Get single issue
router.get('/:id', authenticateToken, checkIssueAccess, issuesController.getIssueById);

// Create new issue
router.post('/', authenticateToken, upload.single('attachment'), [
  body('typeId').notEmpty(),
  body('subTypeId').notEmpty(),
  body('description').notEmpty().isLength({ min: 10 })
], issuesController.createIssue);

// Update issue status
router.patch('/:id/status', authenticateToken, authorizeRoles('admin', 'support'), [
  body('status').isIn(['open', 'in_progress', 'resolved', 'closed'])
], issuesController.updateIssueStatus);

// Assign issue
router.patch('/:id/assign', authenticateToken, authorizeRoles('admin', 'support'), [
  body('assignedTo').notEmpty()
], issuesController.assignIssue);

// Add comment to issue
router.post('/:id/comments', authenticateToken, [
  body('content').notEmpty().isLength({ min: 1 })
], issuesController.addComment);

// Get employee's issues
router.get('/employee/my-issues', authenticateToken, issuesController.getEmployeeIssues);

module.exports = router;
