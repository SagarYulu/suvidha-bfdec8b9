
const IssueService = require('../services/issueService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class IssueController {
  async getIssues(req, res) {
    try {
      const filters = req.query;
      const issues = await IssueService.getAllIssues(filters);
      successResponse(res, issues, 'Issues fetched successfully');
    } catch (error) {
      console.error('Get issues error:', error);
      errorResponse(res, 'Failed to fetch issues', 500);
    }
  }

  async getIssue(req, res) {
    try {
      const { id } = req.params;
      const issue = await IssueService.getIssueById(id);
      successResponse(res, issue, 'Issue fetched successfully');
    } catch (error) {
      console.error('Get issue error:', error);
      errorResponse(res, error.message, 404);
    }
  }

  async createIssue(req, res) {
    try {
      const issueData = req.body;
      const issue = await IssueService.createIssue(issueData);
      successResponse(res, issue, 'Issue created successfully', 201);
    } catch (error) {
      console.error('Create issue error:', error);
      errorResponse(res, 'Failed to create issue', 500);
    }
  }

  async updateIssue(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const issue = await IssueService.updateIssue(id, updateData);
      successResponse(res, issue, 'Issue updated successfully');
    } catch (error) {
      console.error('Update issue error:', error);
      errorResponse(res, error.message, 400);
    }
  }

  async assignIssue(req, res) {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;
      const issue = await IssueService.assignIssue(id, assignedTo);
      successResponse(res, issue, 'Issue assigned successfully');
    } catch (error) {
      console.error('Assign issue error:', error);
      errorResponse(res, 'Failed to assign issue', 500);
    }
  }

  async addComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const comment = await IssueService.addComment(id, req.user.id, content);
      successResponse(res, comment, 'Comment added successfully', 201);
    } catch (error) {
      console.error('Add comment error:', error);
      errorResponse(res, 'Failed to add comment', 500);
    }
  }

  async addInternalComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const comment = await IssueService.addInternalComment(id, req.user.id, content);
      successResponse(res, comment, 'Internal comment added successfully', 201);
    } catch (error) {
      console.error('Add internal comment error:', error);
      errorResponse(res, 'Failed to add internal comment', 500);
    }
  }
}

module.exports = new IssueController();
