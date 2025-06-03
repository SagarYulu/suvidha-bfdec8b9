
const { validationResult } = require('express-validator');
const issuesService = require('../services/issuesService');

const issuesController = {
  async getIssues(req, res) {
    try {
      const filters = req.query;
      const userRole = req.user.role;
      const userId = req.user.id;
      
      const issues = await issuesService.getIssues(filters, userRole, userId);
      res.json({
        success: true,
        issues
      });
    } catch (error) {
      console.error('Get issues error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch issues'
      });
    }
  },

  async getIssueById(req, res) {
    try {
      const issueId = req.params.id;
      const issue = await issuesService.getIssueById(issueId, req.user);
      
      res.json({
        success: true,
        issue
      });
    } catch (error) {
      console.error('Get issue error:', error);
      res.status(error.message === 'Issue not found' ? 404 : 500).json({
        success: false,
        message: error.message || 'Failed to fetch issue'
      });
    }
  },

  async createIssue(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const issueData = {
        ...req.body,
        employee_uuid: req.user.id,
        attachment_url: req.file ? `/uploads/${req.file.filename}` : null
      };

      const issueId = await issuesService.createIssue(issueData);
      res.status(201).json({
        success: true,
        issueId,
        message: 'Issue created successfully'
      });
    } catch (error) {
      console.error('Create issue error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create issue'
      });
    }
  },

  async updateIssueStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const issueId = req.params.id;
      const { status } = req.body;
      const updatedBy = req.user.id;

      await issuesService.updateIssueStatus(issueId, status, updatedBy);
      res.json({
        success: true,
        message: 'Issue status updated successfully'
      });
    } catch (error) {
      console.error('Update issue status error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update issue status'
      });
    }
  },

  async assignIssue(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const issueId = req.params.id;
      const { assignedTo } = req.body;
      const assignedBy = req.user.id;

      await issuesService.assignIssue(issueId, assignedTo, assignedBy);
      res.json({
        success: true,
        message: 'Issue assigned successfully'
      });
    } catch (error) {
      console.error('Assign issue error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to assign issue'
      });
    }
  },

  async addComment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const issueId = req.params.id;
      const { content } = req.body;
      const commentBy = req.user.id;

      await issuesService.addComment(issueId, content, commentBy);
      res.json({
        success: true,
        message: 'Comment added successfully'
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to add comment'
      });
    }
  },

  async getEmployeeIssues(req, res) {
    try {
      const employeeId = req.user.id;
      const issues = await issuesService.getEmployeeIssues(employeeId);
      
      res.json({
        success: true,
        issues
      });
    } catch (error) {
      console.error('Get employee issues error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employee issues'
      });
    }
  }
};

module.exports = issuesController;
