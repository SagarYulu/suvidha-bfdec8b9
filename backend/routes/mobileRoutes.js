const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const { validationRules, handleValidationErrors } = require('../middlewares/validation');

// Mobile-specific authentication routes
router.post('/login', 
  validationRules.userLogin, 
  handleValidationErrors, 
  (req, res, next) => {
    // Mark this as a mobile login request
    req.headers['x-mobile-login'] = 'true';
    next();
  },
  authController.login
);

router.post('/logout', 
  authenticateToken, 
  authController.logout
);

// Mobile access middleware - prevent admin users from accessing mobile endpoints
const preventAdminAccess = (req, res, next) => {
  const user = req.user;
  const adminRoles = ['City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'];
  const adminEmails = ['sagar.km@yulu.bike', 'admin@yulu.com'];
  
  if (user && (adminRoles.includes(user.role) || adminEmails.includes(user.email))) {
    return res.status(403).json({
      success: false,
      error: 'Access denied',
      message: 'Admin users cannot access mobile endpoints. Please use the admin dashboard.'
    });
  }
  
  next();
};

// Apply mobile access protection to all authenticated routes
router.use(authenticateToken);
router.use(preventAdminAccess);

// Mobile-specific issue routes
router.use(authenticateToken);

// Get issues for mobile app (simplified response)
router.get('/issues', async (req, res) => {
  try {
    // For mobile, we typically want to show employee's own issues
    const filters = {
      ...req.query,
      created_by: req.user.id
    };
    
    const issues = await issueController.getAllIssues({ ...req, query: filters }, res);
    
    // Transform response for mobile
    const mobileIssues = issues.map(issue => ({
      id: issue.id,
      title: issue.title || `Issue: ${issue.issue_type}`,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      issueType: issue.issue_type,
      issueSubtype: issue.issue_subtype,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at
    }));
    
    res.status(200).json({
      success: true,
      data: mobileIssues
    });
  } catch (error) {
    console.error('Mobile issues error:', error);
    res.status(500).json({
      error: 'Failed to get issues',
      message: error.message
    });
  }
});

// Create issue from mobile
router.post('/issues', 
  validationRules.createIssue,
  handleValidationErrors,
  async (req, res) => {
    try {
      const issueData = {
        ...req.body,
        created_by: req.user.id
      };
      
      const issue = await issueController.createIssue({ body: issueData }, res);
      
      res.status(201).json({
        success: true,
        message: 'Issue created successfully',
        data: issue
      });
    } catch (error) {
      console.error('Mobile create issue error:', error);
      res.status(500).json({
        error: 'Failed to create issue',
        message: error.message
      });
    }
  }
);

// Get issue details for mobile
router.get('/issues/:id', async (req, res) => {
  try {
    const issue = await issueController.getIssueById(req, res);
    
    // Transform for mobile
    const mobileIssue = {
      id: issue.id,
      title: issue.title || `Issue: ${issue.issue_type}`,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      issueType: issue.issue_type,
      issueSubtype: issue.issue_subtype,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      assignedTo: issue.assigned_to_name,
      attachments: issue.attachment_urls
    };
    
    res.status(200).json({
      success: true,
      data: mobileIssue
    });
  } catch (error) {
    console.error('Mobile issue details error:', error);
    res.status(500).json({
      error: 'Failed to get issue details',
      message: error.message
    });
  }
});

// Mobile app configuration
router.get('/config', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      version: '1.0.0',
      supportedIssueTypes: [
        'salary', 'pf', 'esi', 'leave', 'manager', 'facility', 
        'coworker', 'personal', 'others'
      ],
      maxFileSize: '10MB',
      supportedFileTypes: ['jpg', 'jpeg', 'png', 'pdf'],
      features: {
        fileUpload: true,
        pushNotifications: true,
        offlineMode: false
      }
    }
  });
});

module.exports = router;
