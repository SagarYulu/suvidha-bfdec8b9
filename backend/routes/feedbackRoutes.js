
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const authMiddleware = require('../middlewares/auth');

// All routes require authentication
router.use(authMiddleware.authenticate);

// Submit feedback
router.post('/submit', feedbackController.submitFeedback);

// Get feedback for specific issue
router.get('/issue/:issueId', feedbackController.getFeedbackByIssue);

// Get feedback analytics (admin/manager only)
router.get('/analytics', authMiddleware.authorize(['admin', 'manager']), feedbackController.getFeedbackAnalytics);

// Get sentiment trends (admin/manager only)
router.get('/sentiment-trends', authMiddleware.authorize(['admin', 'manager']), feedbackController.getSentimentTrends);

module.exports = router;
