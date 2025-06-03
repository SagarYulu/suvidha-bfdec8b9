
const express = require('express');
const multer = require('multer');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const issueController = require('../controllers/issueController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 }
});

// Get all issues (Admin/Manager)
router.get('/', 
  authenticateToken, 
  authorizeRole(['admin', 'manager', 'agent']), 
  issueController.getIssues
);

// Get single issue
router.get('/:id', 
  authenticateToken, 
  issueController.getIssueById
);

// Create new issue (Employee)
router.post('/', 
  authenticateToken,
  upload.array('attachments', 5),
  validateRequest(schemas.createIssue), 
  issueController.createIssue
);

// Update issue status
router.patch('/:id/status', 
  authenticateToken, 
  authorizeRole(['admin', 'manager', 'agent']),
  validateRequest(schemas.updateIssueStatus), 
  issueController.updateIssueStatus
);

// Assign issue
router.patch('/:id/assign', 
  authenticateToken, 
  authorizeRole(['admin', 'manager']),
  validateRequest(schemas.assignIssue), 
  issueController.assignIssue
);

// Add comment
router.post('/:id/comments', 
  authenticateToken,
  validateRequest(schemas.addComment), 
  issueController.addComment
);

// Get employee's own issues
router.get('/employee/my-issues', 
  authenticateToken, 
  issueController.getEmployeeIssues
);

module.exports = router;
