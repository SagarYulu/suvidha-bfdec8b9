
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const feedbackController = require('../controllers/feedbackController');

const router = express.Router();

// Submit feedback for a ticket
router.post('/', 
  authenticateToken, 
  feedbackController.submitFeedback
);

// Get feedback for a ticket
router.get('/ticket/:ticketId', 
  authenticateToken, 
  feedbackController.getFeedbackByTicket
);

// Check if feedback exists for a ticket
router.get('/exists/:ticketId', 
  authenticateToken, 
  feedbackController.checkFeedbackExists
);

module.exports = router;
