
const Comment = require('../models/Comment');
const { HTTP_STATUS } = require('../config/constants');
const auditService = require('../services/auditService');

class CommentController {
  async getIssueComments(req, res) {
    try {
      const { id: issueId } = req.params;
      const comments = await Comment.findByIssueId(issueId);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Comments retrieved successfully',
        data: comments
      });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve comments',
        message: error.message
      });
    }
  }

  async addComment(req, res) {
    try {
      const { id: issueId } = req.params;
      const { content } = req.body;
      const employeeUuid = req.user.id;

      const comment = await Comment.create({
        issue_id: issueId,
        employee_uuid: employeeUuid,
        content
      });

      // Log audit trail
      await auditService.logIssueAudit(
        issueId,
        'comment_added',
        { comment_id: comment.id, content },
        employeeUuid,
        req
      );

      res.status(HTTP_STATUS.CREATED).json({
        message: 'Comment added successfully',
        data: comment
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to add comment',
        message: error.message
      });
    }
  }

  async updateComment(req, res) {
    try {
      const { commentId } = req.params;
      const { content } = req.body;

      const comment = await Comment.update(commentId, { content });
      
      if (!comment) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Comment not found'
        });
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'Comment updated successfully',
        data: comment
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to update comment',
        message: error.message
      });
    }
  }

  async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      
      const deleted = await Comment.delete(commentId);
      
      if (!deleted) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Comment not found'
        });
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to delete comment',
        message: error.message
      });
    }
  }
}

module.exports = new CommentController();
