
const Issue = require('../models/Issue');
const Employee = require('../models/Employee');
const Comment = require('../models/Comment');
const { HTTP_STATUS } = require('../config/constants');

class IssueController {
  async getAllIssues(req, res) {
    try {
      const filters = req.query;
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const offset = (page - 1) * limit;
      
      const issues = await Issue.findAll({
        ...filters,
        limit,
        offset
      });
      
      const total = await Issue.getCount(filters);
      const pages = Math.ceil(total / limit);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Issues retrieved successfully',
        data: {
          issues,
          total,
          page,
          limit,
          pages
        }
      });
    } catch (error) {
      console.error('Get issues error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve issues',
        message: error.message
      });
    }
  }

  async getIssueById(req, res) {
    try {
      const { id } = req.params;
      const issue = await Issue.findById(id);
      
      if (!issue) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Issue not found'
        });
      }
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Issue retrieved successfully',
        data: issue
      });
    } catch (error) {
      console.error('Get issue error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve issue',
        message: error.message
      });
    }
  }

  async createIssue(req, res) {
    try {
      const issueData = {
        ...req.body,
        created_by: req.user.id
      };
      
      const issue = await Issue.create(issueData);
      
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Issue created successfully',
        data: issue
      });
    } catch (error) {
      console.error('Create issue error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to create issue',
        message: error.message
      });
    }
  }

  async updateIssue(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const issue = await Issue.findById(id);
      if (!issue) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Issue not found'
        });
      }
      
      const updatedIssue = await Issue.update(id, updates);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Issue updated successfully',
        data: updatedIssue
      });
    } catch (error) {
      console.error('Update issue error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to update issue',
        message: error.message
      });
    }
  }

  async updateIssueStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const issue = await Issue.findById(id);
      if (!issue) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Issue not found'
        });
      }
      
      const updateData = { status };
      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date();
      }
      
      const updatedIssue = await Issue.update(id, updateData);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Issue status updated successfully',
        data: updatedIssue
      });
    } catch (error) {
      console.error('Update issue status error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to update issue status',
        message: error.message
      });
    }
  }

  async assignIssue(req, res) {
    try {
      const { id } = req.params;
      const { assigned_to } = req.body;
      
      const issue = await Issue.findById(id);
      if (!issue) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Issue not found'
        });
      }
      
      const updatedIssue = await Issue.update(id, { 
        assigned_to,
        status: 'in_progress'
      });
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Issue assigned successfully',
        data: updatedIssue
      });
    } catch (error) {
      console.error('Assign issue error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to assign issue',
        message: error.message
      });
    }
  }

  async reopenIssue(req, res) {
    try {
      const { id } = req.params;
      
      const issue = await Issue.findById(id);
      if (!issue) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Issue not found'
        });
      }
      
      const updatedIssue = await Issue.update(id, { 
        status: 'open',
        resolved_at: null
      });
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Issue reopened successfully',
        data: updatedIssue
      });
    } catch (error) {
      console.error('Reopen issue error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to reopen issue',
        message: error.message
      });
    }
  }

  async escalateIssue(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const issue = await Issue.findById(id);
      if (!issue) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Issue not found'
        });
      }
      
      const updatedIssue = await Issue.update(id, { 
        status: 'escalated',
        priority: 'urgent'
      });
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Issue escalated successfully',
        data: updatedIssue
      });
    } catch (error) {
      console.error('Escalate issue error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to escalate issue',
        message: error.message
      });
    }
  }

  async deleteIssue(req, res) {
    try {
      const { id } = req.params;
      
      const issue = await Issue.findById(id);
      if (!issue) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Issue not found'
        });
      }
      
      await Issue.delete(id);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Issue deleted successfully'
      });
    } catch (error) {
      console.error('Delete issue error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to delete issue',
        message: error.message
      });
    }
  }

  async getIssueStatistics(req, res) {
    try {
      const stats = await Issue.getStatistics();
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Issue statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Get issue statistics error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to retrieve issue statistics',
        message: error.message
      });
    }
  }
}

module.exports = new IssueController();
