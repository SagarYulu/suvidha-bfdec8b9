
const express = require('express');
const mobileController = require('../controllers/mobileController');
const { validateIssue, validateComment, handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Issue routes
router.get('/issues/:employeeId', mobileController.getEmployeeIssues);
router.get('/issue/:id', mobileController.getIssueDetails);
router.post('/issues', validateIssue, handleValidationErrors, mobileController.createIssue);

// Comment routes
router.post('/comments', validateComment, handleValidationErrors, mobileController.addComment);

// Profile routes
router.get('/profile/:employeeId', mobileController.getProfile);
router.put('/profile/:employeeId', mobileController.updateProfile);

// Dashboard stats
router.get('/dashboard-stats', mobileController.getDashboardStats);

module.exports = router;
