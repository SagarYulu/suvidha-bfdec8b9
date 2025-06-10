
const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const { body } = require('express-validator');

const router = express.Router();

// Validation middleware
const submitFeedbackValidation = [
  body('sentiment').isIn(['positive', 'neutral', 'negative']).withMessage('Invalid sentiment'),
  body('feedbackText').notEmpty().withMessage('Feedback text is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('category').notEmpty().withMessage('Category is required'),
  body('employeeId').notEmpty().withMessage('Employee ID is required')
];

// Mobile feedback routes
router.post('/submit', submitFeedbackValidation, feedbackController.submitFeedback);
router.get('/history/:employeeId', feedbackController.getFeedbackHistory);
router.get('/analytics/:employeeId', feedbackController.getEmployeeFeedbackAnalytics);

// Admin feedback analytics routes
router.get('/admin/analytics', feedbackController.getAdminFeedbackAnalytics);
router.get('/admin/export', feedbackController.exportFeedbackData);
router.get('/admin/sentiment-trends', feedbackController.getSentimentTrends);
router.get('/admin/category-analysis', feedbackController.getCategoryAnalysis);

module.exports = router;
