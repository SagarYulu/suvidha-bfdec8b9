
const IssueModel = require('../models/Issue');
const CommentModel = require('../models/Comment');
const { v4: uuidv4 } = require('uuid');

class IssueService {
  async getIssues(filters = {}) {
    return await IssueModel.getAll(filters);
  }

  async getIssueById(id) {
    return await IssueModel.findById(id);
  }

  async createIssue(issueData) {
    const issueWithId = {
      ...issueData,
      id: uuidv4()
    };
    
    return await IssueModel.create(issueWithId);
  }

  async updateIssue(id, updateData) {
    const issue = await IssueModel.findById(id);
    if (!issue) {
      throw new Error('Issue not found');
    }

    return await IssueModel.update(id, updateData);
  }

  async assignIssue(issueId, assignedTo) {
    const issue = await IssueModel.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    await IssueModel.assignIssue(issueId, assignedTo);
    return await IssueModel.findById(issueId);
  }

  async addComment(issueId, employeeUuid, content) {
    const issue = await IssueModel.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    return await CommentModel.create({
      issue_id: issueId,
      employee_uuid: employeeUuid,
      content
    });
  }

  async addInternalComment(issueId, employeeUuid, content) {
    const issue = await IssueModel.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    return await CommentModel.createInternal({
      issue_id: issueId,
      employee_uuid: employeeUuid,
      content
    });
  }

  async getAuditTrail(issueId) {
    // Implementation would depend on audit trail model
    // This is a placeholder for the audit trail functionality
    return [];
  }
}

module.exports = new IssueService();
