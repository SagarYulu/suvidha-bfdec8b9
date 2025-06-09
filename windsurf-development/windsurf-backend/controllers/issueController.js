
const IssueService = require('../services/issueService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class IssueController {
  async getIssues(req, res) {
    try {
      const filters = req.query;
      const issues = await IssueService.getIssues(filters);
      
      successResponse(res, issues, 'Issues retrieved successfully');
    } catch (error) {
      console.error('Get issues error:', error);
      errorResponse(res, error.message);
    }
  }

  async getIssue(req, res) {
    try {
      const { id } = req.params;
      const issue = await IssueService.getIssueById(id);
      
      if (!issue) {
        return errorResponse(res, 'Issue not found', 404);
      }
      
      successResponse(res, issue, 'Issue retrieved successfully');
    } catch (error) {
      console.error('Get issue error:', error);
      errorResponse(res, error.message);
    }
  }

  async createIssue(req, res) {
    try {
      const issueData = {
        ...req.body,
        employee_uuid: req.user.id
      };
      
      const issue = await IssueService.createIssue(issueData);
      successResponse(res, issue, 'Issue created successfully', 201);
    } catch (error) {
      console.error('Create issue error:', error);
      errorResponse(res, error.message);
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
      errorResponse(res, error.message);
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
      errorResponse(res, error.message);
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
      errorResponse(res, error.message);
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
      errorResponse(res, error.message);
    }
  }

  async getIssueAuditTrail(req, res) {
    try {
      const { id } = req.params;
      const auditTrail = await IssueService.getAuditTrail(id);
      
      successResponse(res, auditTrail, 'Audit trail retrieved successfully');
    } catch (error) {
      console.error('Get audit trail error:', error);
      errorResponse(res, error.message);
    }
  }
}

module.exports = new IssueController();
