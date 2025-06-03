
const IssueService = require('../services/IssueService');

class IssueController {
  async getIssues(req, res) {
    try {
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        assignedTo: req.query.assignedTo,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const issues = await IssueService.getAllIssues(filters, req.user.role, req.user.id);
      
      res.status(200).json({
        success: true,
        data: issues
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getIssueById(req, res) {
    try {
      const { id } = req.params;
      const issue = await IssueService.getIssueById(id);

      if (!issue) {
        return res.status(404).json({
          success: false,
          message: 'Issue not found'
        });
      }

      // Get comments for this issue
      const comments = await IssueService.getIssueComments(id);
      issue.comments = comments;

      res.status(200).json({
        success: true,
        data: issue
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createIssue(req, res) {
    try {
      const issueData = {
        ...req.body,
        employeeUuid: req.user.id
      };

      const issue = await IssueService.createIssue(issueData);
      
      res.status(201).json({
        success: true,
        data: issue,
        message: 'Issue created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateIssueStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const issue = await IssueService.updateIssueStatus(id, status, req.user.id);
      
      res.status(200).json({
        success: true,
        data: issue,
        message: 'Issue status updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async assignIssue(req, res) {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;
      
      const issue = await IssueService.assignIssue(id, assignedTo);
      
      res.status(200).json({
        success: true,
        data: issue,
        message: 'Issue assigned successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async addComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      const comment = await IssueService.addComment(id, content, req.user.id);
      
      res.status(201).json({
        success: true,
        data: comment,
        message: 'Comment added successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getIssueComments(req, res) {
    try {
      const { id } = req.params;
      const comments = await IssueService.getIssueComments(id);
      
      res.status(200).json({
        success: true,
        data: comments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new IssueController();
