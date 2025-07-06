
const InternalComment = require('../models/InternalComment');
const { HTTP_STATUS } = require('../config/constants');

class InternalCommentController {
  async getInternalComments(req, res) {
    try {
      const { issueId } = req.params;
      const comments = await InternalComment.findByIssueId(issueId);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Internal comments retrieved successfully',
        data: comments
      });
    } catch (error) {
      console.error('Get internal comments error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve internal comments',
        message: error.message
      });
    }
  }

  async createInternalComment(req, res) {
    try {
      const { issueId } = req.params;
      const { content } = req.body;
      const employeeUuid = req.user.id;

      const comment = await InternalComment.create({
        issue_id: issueId,
        employee_uuid: employeeUuid,
        content
      });

      res.status(HTTP_STATUS.CREATED).json({
        message: 'Internal comment created successfully',
        data: comment
      });
    } catch (error) {
      console.error('Create internal comment error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to create internal comment',
        message: error.message
      });
    }
  }

  async updateInternalComment(req, res) {
    try {
      const { commentId } = req.params;
      const { content } = req.body;

      const comment = await InternalComment.update(commentId, { content });
      
      if (!comment) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Internal comment not found'
        });
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'Internal comment updated successfully',
        data: comment
      });
    } catch (error) {
      console.error('Update internal comment error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to update internal comment',
        message: error.message
      });
    }
  }

  async deleteInternalComment(req, res) {
    try {
      const { commentId } = req.params;
      
      const deleted = await InternalComment.delete(commentId);
      
      if (!deleted) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Internal comment not found'
        });
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'Internal comment deleted successfully'
      });
    } catch (error) {
      console.error('Delete internal comment error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to delete internal comment',
        message: error.message
      });
    }
  }
}

module.exports = new InternalCommentController();
