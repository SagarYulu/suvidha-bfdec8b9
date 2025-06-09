
const IssueService = require('../services/issueService');
const EmployeeModel = require('../models/Employee');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class MobileController {
  async getEmployeeIssues(req, res) {
    try {
      const { employeeId } = req.params;
      const issues = await IssueService.getEmployeeIssues(employeeId);
      successResponse(res, issues, 'Employee issues fetched successfully');
    } catch (error) {
      console.error('Get employee issues error:', error);
      errorResponse(res, 'Failed to fetch employee issues', 500);
    }
  }

  async getIssueDetails(req, res) {
    try {
      const { id } = req.params;
      const issue = await IssueService.getIssueById(id);
      successResponse(res, issue, 'Issue details fetched successfully');
    } catch (error) {
      console.error('Get issue details error:', error);
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

  async addComment(req, res) {
    try {
      const { issue_id, content, employee_id } = req.body;
      const comment = await IssueService.addComment(issue_id, employee_id, content);
      successResponse(res, comment, 'Comment added successfully', 201);
    } catch (error) {
      console.error('Add comment error:', error);
      errorResponse(res, 'Failed to add comment', 500);
    }
  }

  async getProfile(req, res) {
    try {
      const { employeeId } = req.params;
      const employee = await EmployeeModel.findById(employeeId);
      if (!employee) {
        return errorResponse(res, 'Employee not found', 404);
      }
      successResponse(res, employee, 'Profile fetched successfully');
    } catch (error) {
      console.error('Get profile error:', error);
      errorResponse(res, 'Failed to fetch profile', 500);
    }
  }

  async updateProfile(req, res) {
    try {
      const { employeeId } = req.params;
      const profileData = req.body;
      await EmployeeModel.updateProfile(employeeId, profileData);
      const employee = await EmployeeModel.findById(employeeId);
      successResponse(res, employee, 'Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      errorResponse(res, 'Failed to update profile', 500);
    }
  }

  async getDashboardStats(req, res) {
    try {
      // Basic dashboard stats for mobile
      const stats = {
        totalIssues: 0,
        openIssues: 0,
        resolvedIssues: 0
      };
      successResponse(res, stats, 'Dashboard stats fetched successfully');
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      errorResponse(res, 'Failed to fetch dashboard stats', 500);
    }
  }
}

module.exports = new MobileController();
