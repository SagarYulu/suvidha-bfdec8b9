
const IssueModel = require('../models/Issue');
const CommentModel = require('../models/Comment');

class IssueService {
  static async createIssue(issueData) {
    return await IssueModel.create(issueData);
  }

  static async getIssueById(id) {
    const issue = await IssueModel.findById(id);
    if (!issue) {
      throw new Error('Issue not found');
    }

    const comments = await CommentModel.getByIssue(id);
    return { ...issue, comments };
  }

  static async getAllIssues(filters) {
    return await IssueModel.getAll(filters);
  }

  static async updateIssue(id, updateData) {
    const updated = await IssueModel.update(id, updateData);
    if (!updated) {
      throw new Error('Issue not found or no changes made');
    }
    return await IssueModel.findById(id);
  }

  static async assignIssue(issueId, assignedTo) {
    await IssueModel.assignIssue(issueId, assignedTo);
    return await IssueModel.findById(issueId);
  }

  static async addComment(issueId, employeeId, content) {
    return await CommentModel.create({
      issue_id: issueId,
      employee_uuid: employeeId,
      content
    });
  }

  static async addInternalComment(issueId, userId, content) {
    return await CommentModel.createInternal({
      issue_id: issueId,
      employee_uuid: userId,
      content
    });
  }

  static async getEmployeeIssues(employeeId) {
    return await IssueModel.getByEmployee(employeeId);
  }
}

module.exports = IssueService;
