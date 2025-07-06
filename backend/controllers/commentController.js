
const Comment = require('../models/Comment');
const { HTTP_STATUS } = require('../config/constants');

class CommentController {
  async getIssueComments(req, res) {
    try {
      const { id } = req.params; // issue id
      const comments = await Comment.findByIssueId(id);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Comments retrieved successfully',
        data: comments
      });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve comments',
        message: error.message
      });
    }
  }

  async addComment(req, res) {
    try {
      const { id } = req.params; // issue id
      const { content } = req.body;
      const user_id = req.user.id;
      
      const comment = await Comment.create({
        issue_id: id,
        user_id,
        content
      });
      
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
      const user_id = req.user.id;
      
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Comment not found'
        });
      }
      
      // Check if user owns the comment or is admin
      if (comment.user_id !== user_id && req.user.role !== 'admin') {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: 'Not authorized to update this comment'
        });
      }
      
      const updatedComment = await Comment.update(commentId, { content });
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Comment updated successfully',
        data: updatedComment
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
      const user_id = req.user.id;
      
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Comment not found'
        });
      }
      
      // Check if user owns the comment or is admin
      if (comment.user_id !== user_id && req.user.role !== 'admin') {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: 'Not authorized to delete this comment'
        });
      }
      
      await Comment.delete(commentId);
      
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
