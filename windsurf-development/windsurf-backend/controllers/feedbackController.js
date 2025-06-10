
const feedbackService = require('../services/feedbackService');
const { validationResult } = require('express-validator');

class FeedbackController {
  async submitFeedback(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const feedbackData = {
        ...req.body,
        employee_uuid: req.user.id,
        submitted_at: new Date()
      };
      
      const feedback = await feedbackService.submitFeedback(feedbackData);
      
      res.status(201).json({
        success: true,
        data: feedback,
        message: 'Feedback submitted successfully'
      });
    } catch (error) {
      console.error('Submit feedback error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit feedback',
        message: error.message
      });
    }
  }

  async getFeedbackHistory(req, res) {
    try {
      const { employeeId } = req.params;
      const { page = 1, limit = 10, sentiment } = req.query;
      
      const history = await feedbackService.getFeedbackHistory(employeeId, { 
        page: parseInt(page), 
        limit: parseInt(limit),
        sentiment 
      });
      
      res.json({
        success: true,
        data: history.feedback,
        pagination: history.pagination
      });
    } catch (error) {
      console.error('Get feedback history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch feedback history',
        message: error.message
      });
    }
  }

  async getFeedbackAnalytics(req, res) {
    try {
      const { dateRange, city, cluster } = req.query;
      const analytics = await feedbackService.getFeedbackAnalytics({ 
        dateRange, 
        city, 
        cluster 
      });
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get feedback analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch feedback analytics',
        message: error.message
      });
    }
  }

  async getSentimentTrends(req, res) {
    try {
      const { timeframe = '6months', city, cluster } = req.query;
      const trends = await feedbackService.getSentimentTrends(timeframe, { city, cluster });
      
      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      console.error('Get sentiment trends error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sentiment trends',
        message: error.message
      });
    }
  }

  async getFeedbackByIssue(req, res) {
    try {
      const { issueId } = req.params;
      const feedback = await feedbackService.getFeedbackByIssue(issueId);
      
      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      console.error('Get feedback by issue error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch issue feedback',
        message: error.message
      });
    }
  }

  async updateFeedback(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const feedback = await feedbackService.updateFeedback(id, updateData);
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          error: 'Feedback not found'
        });
      }
      
      res.json({
        success: true,
        data: feedback,
        message: 'Feedback updated successfully'
      });
    } catch (error) {
      console.error('Update feedback error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update feedback',
        message: error.message
      });
    }
  }

  async deleteFeedback(req, res) {
    try {
      const { id } = req.params;
      
      const deleted = await feedbackService.deleteFeedback(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Feedback not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Feedback deleted successfully'
      });
    } catch (error) {
      console.error('Delete feedback error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete feedback',
        message: error.message
      });
    }
  }
}

module.exports = new FeedbackController();
