
const FeedbackModel = require('../models/Feedback');
const IssueModel = require('../models/Issue');
const NotificationService = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { v4: uuidv4 } = require('uuid');

class FeedbackController {
  async createFeedback(req, res) {
    try {
      const { issue_id, rating, comment } = req.body;
      const employee_uuid = req.user.id;

      // Verify issue exists and user can give feedback
      const issue = await IssueModel.findById(issue_id);
      if (!issue) {
        return errorResponse(res, 'Issue not found', 404);
      }

      if (issue.employee_uuid !== employee_uuid) {
        return errorResponse(res, 'You can only provide feedback for your own issues', 403);
      }

      if (issue.status !== 'resolved' && issue.status !== 'closed') {
        return errorResponse(res, 'Feedback can only be provided for resolved or closed issues', 400);
      }

      const feedbackData = {
        id: uuidv4(),
        issue_id,
        employee_uuid,
        rating,
        comment
      };

      const feedback = await FeedbackModel.create(feedbackData);

      // Notify assigned agent about feedback
      if (issue.assigned_to) {
        await NotificationService.createNotification({
          user_id: issue.assigned_to,
          issue_id: issue_id,
          type: 'feedback_received',
          title: 'Feedback Received',
          message: `Feedback received for issue ${issue_id} - Rating: ${rating}/5`
        });
      }

      successResponse(res, feedback, 'Feedback submitted successfully', 201);
    } catch (error) {
      console.error('Create feedback error:', error);
      errorResponse(res, error.message);
    }
  }

  async getFeedback(req, res) {
    try {
      const { id } = req.params;
      const feedback = await FeedbackModel.findById(id);

      if (!feedback) {
        return errorResponse(res, 'Feedback not found', 404);
      }

      successResponse(res, feedback, 'Feedback retrieved successfully');
    } catch (error) {
      console.error('Get feedback error:', error);
      errorResponse(res, error.message);
    }
  }

  async getIssueFeedback(req, res) {
    try {
      const { issue_id } = req.params;
      
      // Verify issue exists
      const issue = await IssueModel.findById(issue_id);
      if (!issue) {
        return errorResponse(res, 'Issue not found', 404);
      }

      const feedback = await FeedbackModel.findByIssueId(issue_id);
      const averageRating = await FeedbackModel.getAverageRating(issue_id);

      successResponse(res, {
        feedback,
        average_rating: averageRating.average_rating,
        total_feedback: averageRating.total_feedback
      }, 'Issue feedback retrieved successfully');
    } catch (error) {
      console.error('Get issue feedback error:', error);
      errorResponse(res, error.message);
    }
  }

  async getFeedbackStats(req, res) {
    try {
      const filters = {
        startDate: req.query.start_date,
        endDate: req.query.end_date,
        assigned_to: req.query.assigned_to
      };

      const stats = await FeedbackModel.getFeedbackStats(filters);

      // Calculate satisfaction metrics
      const satisfactionRate = stats.total_feedback > 0 
        ? (stats.positive_feedback / stats.total_feedback) * 100 
        : 0;

      const dissatisfactionRate = stats.total_feedback > 0 
        ? (stats.negative_feedback / stats.total_feedback) * 100 
        : 0;

      const result = {
        ...stats,
        satisfaction_rate: satisfactionRate,
        dissatisfaction_rate: dissatisfactionRate,
        neutral_feedback: stats.total_feedback - stats.positive_feedback - stats.negative_feedback
      };

      successResponse(res, result, 'Feedback statistics retrieved successfully');
    } catch (error) {
      console.error('Get feedback stats error:', error);
      errorResponse(res, error.message);
    }
  }

  async getMyFeedback(req, res) {
    try {
      const employee_uuid = req.user.id;
      
      // Get all issues for this user with their feedback
      const issues = await IssueModel.getAll({ employee_uuid });
      
      const feedbackData = [];
      
      for (const issue of issues) {
        const feedback = await FeedbackModel.findByIssueId(issue.id);
        if (feedback.length > 0) {
          feedbackData.push({
            issue_id: issue.id,
            issue_description: issue.description,
            issue_status: issue.status,
            feedback: feedback[0] // Assuming one feedback per issue per user
          });
        }
      }

      successResponse(res, feedbackData, 'User feedback retrieved successfully');
    } catch (error) {
      console.error('Get my feedback error:', error);
      errorResponse(res, error.message);
    }
  }

  async updateFeedback(req, res) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const employee_uuid = req.user.id;

      const feedback = await FeedbackModel.findById(id);
      if (!feedback) {
        return errorResponse(res, 'Feedback not found', 404);
      }

      if (feedback.employee_uuid !== employee_uuid) {
        return errorResponse(res, 'You can only update your own feedback', 403);
      }

      // Check if feedback was submitted recently (allow updates within 24 hours)
      const feedbackDate = new Date(feedback.created_at);
      const now = new Date();
      const hoursDiff = (now - feedbackDate) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        return errorResponse(res, 'Feedback can only be updated within 24 hours of submission', 400);
      }

      const updatedFeedback = await FeedbackModel.update(id, {
        rating: rating || feedback.rating,
        comment: comment || feedback.comment,
        updated_at: new Date().toISOString()
      });

      successResponse(res, updatedFeedback, 'Feedback updated successfully');
    } catch (error) {
      console.error('Update feedback error:', error);
      errorResponse(res, error.message);
    }
  }

  async deleteFeedback(req, res) {
    try {
      const { id } = req.params;
      const employee_uuid = req.user.id;
      const userRole = req.user.role;

      const feedback = await FeedbackModel.findById(id);
      if (!feedback) {
        return errorResponse(res, 'Feedback not found', 404);
      }

      // Only allow deletion by the feedback author or admin
      if (feedback.employee_uuid !== employee_uuid && userRole !== 'admin') {
        return errorResponse(res, 'Permission denied', 403);
      }

      await FeedbackModel.delete(id);

      successResponse(res, null, 'Feedback deleted successfully');
    } catch (error) {
      console.error('Delete feedback error:', error);
      errorResponse(res, error.message);
    }
  }
}

module.exports = new FeedbackController();
