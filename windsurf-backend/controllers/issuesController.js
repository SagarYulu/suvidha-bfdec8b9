const issuesService = require('../services/issuesService');

const issuesController = {
  async getIssues(req, res) {
    try {
      const issues = await issuesService.getIssues(req.query);
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
      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      res.json({
        success: true,
        issue
      });
    } catch (error) {
      console.error('Get issue by ID error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createIssue(req, res) {
    try {
      const result = await issuesService.createIssue(req.body, req.user, req.file);
      res.status(201).json(result);
    } catch (error) {
      console.error('Create issue error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateIssueStatus(req, res) {
    try {
      const result = await issuesService.updateIssueStatus(req.params.id, req.body.status, req.user);
      res.json(result);
    } catch (error) {
      console.error('Update issue status error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async assignIssue(req, res) {
    try {
      const result = await issuesService.assignIssue(req.params.id, req.body.assignedTo, req.user);
      res.json(result);
    } catch (error) {
      console.error('Assign issue error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async addComment(req, res) {
    try {
      const result = await issuesService.addComment(req.params.id, req.body.content, req.user);
      res.status(201).json(result);
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
