
const feedbackService = require('../services/feedbackService');
const { validationResult } = require('express-validator');

class FeedbackController {
  async submitFeedback(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const feedbackData = {
        ...req.body,
        submittedAt: new Date()
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

  async getFeedbackHistory(req, res) {
    try {
      const { employeeId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      const history = await feedbackService.getFeedbackHistory(employeeId, { page, limit });
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Get feedback history error:', error);
      res.status(500).json({
        error: 'Failed to fetch feedback history',
        message: error.message
      });
    }
  }

  async getEmployeeFeedbackAnalytics(req, res) {
    try {
      const { employeeId } = req.params;
      const analytics = await feedbackService.getEmployeeFeedbackAnalytics(employeeId);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get employee feedback analytics error:', error);
      res.status(500).json({
        error: 'Failed to fetch employee feedback analytics',
        message: error.message
      });
    }
  }

  async getAdminFeedbackAnalytics(req, res) {
    try {
      const { dateRange, category, sentiment } = req.query;
      const analytics = await feedbackService.getAdminFeedbackAnalytics({ 
        dateRange, 
        category, 
        sentiment 
      });
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get admin feedback analytics error:', error);
      res.status(500).json({
        error: 'Failed to fetch admin feedback analytics',
        message: error.message
      });
    }
  }

  async exportFeedbackData(req, res) {
    try {
      const { format = 'csv', dateRange, category, sentiment } = req.query;
      const data = await feedbackService.exportFeedbackData({ 
        format, 
        dateRange, 
        category, 
        sentiment 
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=feedback-export.csv');
      res.send(data);
    } catch (error) {
      console.error('Export feedback data error:', error);
      res.status(500).json({
        error: 'Failed to export feedback data',
        message: error.message
      });
    }
  }

  async getSentimentTrends(req, res) {
    try {
      const { timeframe = '6months' } = req.query;
      const trends = await feedbackService.getSentimentTrends(timeframe);
      
      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      console.error('Get sentiment trends error:', error);
      res.status(500).json({
        error: 'Failed to fetch sentiment trends',
        message: error.message
      });
    }
  }

  async getCategoryAnalysis(req, res) {
    try {
      const { dateRange } = req.query;
      const analysis = await feedbackService.getCategoryAnalysis(dateRange);
      
      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Get category analysis error:', error);
      res.status(500).json({
        error: 'Failed to fetch category analysis',
        message: error.message
      });
    }
  }
}

module.exports = new FeedbackController();
