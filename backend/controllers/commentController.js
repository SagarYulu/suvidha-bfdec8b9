
const Comment = require('../models/Comment');
const NotificationService = require('../services/notificationService');
const { HTTP_STATUS } = require('../config/constants');

class CommentController {
  async getIssueComments(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      
      const comments = await Comment.findByIssueId(id, parseInt(limit), offset);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Comments retrieved successfully',
        data: comments
      });
    } catch (error) {
      console.error('Get issue comments error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to get comments',
        message: error.message
      });
    }
  }

  async addComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user.id;
      
      const comment = await Comment.create({
        issue_id: id,
        user_id: userId,
        content
      });
      
      // Create notification for comment
      await NotificationService.notifyNewComment(id, comment.id, userId);
      
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Comment added successfully',
        data: comment
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to add comment',
        message: error.message
      });
    }
  }

  async updateComment(req, res) {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;
      
      const comment = await Comment.update(commentId, { content }, userId);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Comment updated successfully',
        data: comment
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to update comment',
        message: error.message
      });
    }
  }

  async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;
      
      await Comment.delete(commentId, userId);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to delete comment',
        message: error.message
      });
    }
  }
}

module.exports = new CommentController();
