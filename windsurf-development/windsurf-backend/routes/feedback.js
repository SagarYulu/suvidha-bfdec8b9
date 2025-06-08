
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');

// Get feedback analytics
router.get('/analytics', auth, feedbackController.getFeedbackAnalytics);

// Submit feedback
router.post('/', auth, validation.validateRequest(validation.schemas.submitFeedback), feedbackController.submitFeedback);

// Get feedback by ID
router.get('/:id', auth, feedbackController.getFeedbackById);

module.exports = router;
