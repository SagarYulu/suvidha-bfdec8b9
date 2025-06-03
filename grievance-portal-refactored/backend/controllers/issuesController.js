
const issuesService = require('../services/issuesService');
const { validationResult } = require('express-validator');

const issuesController = {
  async getIssues(req, res) {
    try {
      const issues = await issuesService.getIssues(req.query, req.user);
      res.json({
        success: true,
        issues
      });
    } catch (error) {
      console.error('Get issues error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getIssueById(req, res) {
    try {
      const issue = await issuesService.getIssueById(req.params.id, req.user);
      res.json({
        success: true,
        issue
      });
    } catch (error) {
      if (error.message === 'Issue not found') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Get issue error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createIssue(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const issueData = {
        ...req.body,
        employeeUuid: req.user.id,
        attachmentUrl: req.file ? `/uploads/${req.file.filename}` : null
      };

      const result = await issuesService.createIssue(issueData);
      res.status(201).json(result);
    } catch (error) {
      console.error('Create issue error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateIssueStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      await issuesService.updateIssueStatus(req.params.id, req.body.status);
      res.json({
        success: true,
        message: 'Issue status updated successfully'
      });
    } catch (error) {
      if (error.message === 'Issue not found') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Update status error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async assignIssue(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      await issuesService.assignIssue(req.params.id, req.body.assignedTo);
      res.json({
        success: true,
        message: 'Issue assigned successfully'
      });
    } catch (error) {
      if (error.message === 'Issue not found') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Assign issue error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async addComment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      await issuesService.addComment(req.params.id, req.body.content, req.user);
      res.status(201).json({
        success: true,
        message: 'Comment added successfully'
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getEmployeeIssues(req, res) {
    try {
      const issues = await issuesService.getEmployeeIssues(req.user.id);
      res.json({
        success: true,
        issues
      });
    } catch (error) {
      console.error('Get employee issues error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = issuesController;
