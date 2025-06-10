
const issueService = require('../services/issueService');
const tatService = require('../services/tatService');
const emailService = require('../services/emailService');
const realTimeService = require('../services/realTimeService');
const { validationResult } = require('express-validator');

class IssueController {
  async getIssues(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { page = 1, limit = 10, status, priority, assignedTo, city, cluster } = req.query;
      const filters = { status, priority, assignedTo, city, cluster };
      
      const result = await issueService.getIssues(filters, { page: parseInt(page), limit: parseInt(limit) });
      
      res.json({
        success: true,
        data: result.issues,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get issues error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch issues'
      });
    }
  }

  async getIssue(req, res) {
    try {
      const { id } = req.params;
      const issue = await issueService.getIssueById(id);
      
      if (!issue) {
        return res.status(404).json({
          success: false,
          error: 'Issue not found'
        });
      }
      
      res.json({
        success: true,
        data: issue
      });
    } catch (error) {
      console.error('Get issue error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch issue'
      });
    }
  }

  async createIssue(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const issueData = {
        ...req.body,
        created_by: req.user.id
      };
      
      const issue = await issueService.createIssue(issueData);
      
      // Notify real-time subscribers
      realTimeService.notifyIssueUpdate(issue.id, 'issue_created', issue);
      
      // Send email notification if assigned
      if (issue.assigned_to) {
        const assignee = await issueService.getUserById(issue.assigned_to);
        const creator = await issueService.getUserById(issue.employee_uuid);
        if (assignee && creator) {
          await emailService.sendAssignmentEmail(issue, assignee, creator);
        }
      }
      
      res.status(201).json({
        success: true,
        data: issue,
        message: 'Issue created successfully'
      });
    } catch (error) {
      console.error('Create issue error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create issue'
      });
    }
  }

  async updateIssue(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const updateData = {
        ...req.body,
        updated_by: req.user.id
      };
      
      const oldIssue = await issueService.getIssueById(id);
      if (!oldIssue) {
        return res.status(404).json({
          success: false,
          error: 'Issue not found'
        });
      }
      
      const updatedIssue = await issueService.updateIssue(id, updateData);
      
      // Notify real-time subscribers
      realTimeService.notifyIssueUpdate(id, 'issue_updated', updatedIssue);
      
      // Send status change email if status changed
      if (oldIssue.status !== updatedIssue.status) {
        const employee = await issueService.getUserById(updatedIssue.employee_uuid);
        if (employee) {
          await emailService.sendStatusChangeEmail(updatedIssue, employee, oldIssue.status);
        }
        
        // Notify about status change
        realTimeService.notifyStatusChange(id, oldIssue.status, updatedIssue.status, req.user.id);
      }
      
      res.json({
        success: true,
        data: updatedIssue,
        message: 'Issue updated successfully'
      });
    } catch (error) {
      console.error('Update issue error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update issue'
      });
    }
  }

  async assignIssue(req, res) {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;
      
      const issue = await issueService.assignIssue(id, assignedTo, req.user.id);
      
      if (!issue) {
        return res.status(404).json({
          success: false,
          error: 'Issue not found'
        });
      }
      
      // Notify real-time subscribers
      realTimeService.notifyAssignment(id, assignedTo, req.user.id);
      
      // Send assignment email
      const assignee = await issueService.getUserById(assignedTo);
      const employee = await issueService.getUserById(issue.employee_uuid);
      if (assignee && employee) {
        await emailService.sendAssignmentEmail(issue, assignee, employee);
      }
      
      res.json({
        success: true,
        data: issue,
        message: 'Issue assigned successfully'
      });
    } catch (error) {
      console.error('Assign issue error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign issue'
      });
    }
  }

  async addComment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const { content } = req.body;
      
      const comment = await issueService.addComment(id, {
        content,
        employee_uuid: req.user.id,
        is_internal: false
      });
      
      const issue = await issueService.getIssueById(id);
      
      // Notify real-time subscribers
      realTimeService.notifyNewComment(id, comment);
      
      // Send comment notification email
      const commenter = await issueService.getUserById(req.user.id);
      const employee = await issueService.getUserById(issue.employee_uuid);
      if (commenter && employee && commenter.id !== employee.id) {
        await emailService.sendCommentNotification(issue, commenter, employee, comment);
      }
      
      res.status(201).json({
        success: true,
        data: comment,
        message: 'Comment added successfully'
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add comment'
      });
    }
  }

  async addInternalComment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const { content } = req.body;
      
      const comment = await issueService.addComment(id, {
        content,
        employee_uuid: req.user.id,
        is_internal: true
      });
      
      // Notify real-time subscribers (internal comments go to admins only)
      realTimeService.broadcast('internal_comments', {
        type: 'internal_comment_added',
        issueId: id,
        comment
      });
      
      res.status(201).json({
        success: true,
        data: comment,
        message: 'Internal comment added successfully'
      });
    } catch (error) {
      console.error('Add internal comment error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add internal comment'
      });
    }
  }

  async getIssueAuditTrail(req, res) {
    try {
      const { id } = req.params;
      const auditTrail = await issueService.getAuditTrail(id);
      
      res.json({
        success: true,
        data: auditTrail
      });
    } catch (error) {
      console.error('Get audit trail error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audit trail'
      });
    }
  }
}

module.exports = new IssueController();
