
const feedbackService = require('../services/feedbackService');

class FeedbackController {
  async getFeedbackAnalytics(req, res) {
    try {
      const { timeframe, issueType, sentiment } = req.query;
      const analytics = await feedbackService.getFeedbackAnalytics({ timeframe, issueType, sentiment });
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Feedback analytics error:', error);
      res.status(500).json({
        error: 'Failed to fetch feedback analytics',
        message: error.message
      });
    }
  }

  async submitFeedback(req, res) {
    try {
      const feedbackData = {
        ...req.body,
        userId: req.user.id
      };
      
      const feedbackId = await feedbackService.submitFeedback(feedbackData);
      
      res.status(201).json({
        success: true,
        data: { id: feedbackId },
        message: 'Feedback submitted successfully'
      });
    } catch (error) {
      console.error('Submit feedback error:', error);
      res.status(500).json({
        error: 'Failed to submit feedback',
        message: error.message
      });
    }
  }

  async getFeedbackById(req, res) {
    try {
      const { id } = req.params;
      const feedback = await feedbackService.getFeedbackById(id);
      
      if (!feedback) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      
      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      console.error('Get feedback error:', error);
      res.status(500).json({
        error: 'Failed to fetch feedback',
        message: error.message
      });
    }
  }
}

module.exports = new FeedbackController();
