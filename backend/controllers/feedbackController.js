
const Feedback = require('../models/Feedback');
const SentimentAnalyzer = require('../services/sentimentAnalyzer');
const { HTTP_STATUS } = require('../config/constants');

class FeedbackController {
  async submitFeedback(req, res) {
    try {
      const { issue_id, feedback_option, employee_uuid, agent_id, agent_name } = req.body;
      
      // Analyze sentiment
      const sentiment = await SentimentAnalyzer.analyzeFeedback(feedback_option);
      
      // Get employee details for city/cluster
      const Employee = require('../models/Employee');
      const employee = await Employee.findById(employee_uuid);
      
      const feedbackData = {
        issue_id,
        employee_uuid,
        feedback_option,
        sentiment: sentiment.label,
        agent_id,
        agent_name,
        city: employee?.city,
        cluster: employee?.cluster
      };
      
      const feedback = await Feedback.create(feedbackData);
      
      res.status(HTTP_STATUS.CREATED).json({
        message: 'Feedback submitted successfully',
        data: {
          ...feedback,
          sentiment_analysis: sentiment
        }
      });
    } catch (error) {
      console.error('Submit feedback error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to submit feedback',
        message: error.message
      });
    }
  }

  async getFeedbackAnalytics(req, res) {
    try {
      const { startDate, endDate, city, cluster, agent_id } = req.query;
      
      const filters = {
        startDate,
        endDate,
        city,
        cluster,
        agent_id
      };
      
      const analytics = await Feedback.getAnalytics(filters);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Feedback analytics retrieved successfully',
        data: analytics
      });
    } catch (error) {
      console.error('Get feedback analytics error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve feedback analytics',
        message: error.message
      });
    }
  }

  async getSentimentTrends(req, res) {
    try {
      const { period = '30d', city, cluster } = req.query;
      
      const trends = await Feedback.getSentimentTrends({
        period,
        city,
        cluster
      });
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Sentiment trends retrieved successfully',
        data: trends
      });
    } catch (error) {
      console.error('Get sentiment trends error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve sentiment trends',
        message: error.message
      });
    }
  }

  async getFeedbackByIssue(req, res) {
    try {
      const { issueId } = req.params;
      
      const feedback = await Feedback.findByIssueId(issueId);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Issue feedback retrieved successfully',
        data: feedback
      });
    } catch (error) {
      console.error('Get issue feedback error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve issue feedback',
        message: error.message
      });
    }
  }
}

module.exports = new FeedbackController();
