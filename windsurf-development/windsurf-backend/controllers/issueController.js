
const issueService = require('../services/issueService');
const enhancedEmailService = require('../services/enhancedEmailService');
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

      const { page = 1, limit = 10, ...filters } = req.query;
      
      // Apply role-based filtering
      if (req.user.role === 'employee') {
        filters.employeeUuid = req.user.id;
      }

      const result = await issueService.getIssues(filters, parseInt(page), parseInt(limit));
      
      res.json({
        success: true,
        ...result
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

      // Role-based access control
      if (req.user.role === 'employee' && issue.employee_uuid !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      res.json({
        success: true,
        issue
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
        createdBy: req.user.id
      };

      const issueId = await issueService.createIssue(issueData);
      
      if (!issueId) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create issue'
        });
      }

      // Send real-time notification
      realTimeService.broadcast('issue_created', {
        issueId,
        createdBy: req.user.id,
        timestamp: new Date().toISOString()
      });

      res.status(201).json({
        success: true,
        issueId,
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
      const updateData = req.body;

      // Get current issue for comparison
      const currentIssue = await issueService.getIssueById(id);
      if (!currentIssue) {
        return res.status(404).json({
          success: false,
          error: 'Issue not found'
        });
      }

      const updated = await issueService.updateIssue(id, updateData);
      
      if (!updated) {
        return res.status(500).json({
          success: false,
          error: 'Failed to update issue'
        });
      }

      // Send email notification for status changes
      if (updateData.status && updateData.status !== currentIssue.status) {
        try {
          await enhancedEmailService.sendIssueStatusUpdateEmail(
            currentIssue.employee_email,
            currentIssue.employee_name,
            currentIssue,
            currentIssue.status,
            updateData.status
          );
          console.log('Status change email sent successfully');
        } catch (emailError) {
          console.error('Status change email failed:', emailError);
        }

        // Send real-time notification
        realTimeService.notifyStatusChange(
          id,
          currentIssue.employee_uuid,
          {
            oldStatus: currentIssue.status,
            newStatus: updateData.status,
            updatedBy: req.user.id
          }
        );
      }

      // Send real-time update notification
      realTimeService.notifyIssueUpdate(
        id,
        currentIssue.employee_uuid,
        {
          ...updateData,
          updatedBy: req.user.id
        }
      );

      res.json({
        success: true,
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

      if (!assignedTo) {
        return res.status(400).json({
          success: false,
          error: 'Assigned user ID is required'
        });
      }

      const assigned = await issueService.assignIssue(id, assignedTo, req.user.id);
      
      if (!assigned) {
        return res.status(500).json({
          success: false,
          error: 'Failed to assign issue'
        });
      }

      // Get issue and assignee details for email
      const issue = await issueService.getIssueById(id);
      
      // Send email notification to assignee
      try {
        await enhancedEmailService.sendIssueAssignmentEmail(
          issue.assigned_email,
          issue.assigned_name,
          {
            ...issue,
            assigned_by_name: req.user.name
          }
        );
        console.log('Assignment email sent successfully');
      } catch (emailError) {
        console.error('Assignment email failed:', emailError);
      }

      // Send real-time notification
      realTimeService.notifyAssignment(
        id,
        assignedTo,
        {
          assignedBy: req.user.id,
          assignedByName: req.user.name,
          issueTitle: issue.title || issue.description.substring(0, 50)
        }
      );

      res.json({
        success: true,
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

      const commentId = await issueService.addComment(id, req.user.id, content);
      
      if (!commentId) {
        return res.status(500).json({
          success: false,
          error: 'Failed to add comment'
        });
      }

      // Get issue details for notification
      const issue = await issueService.getIssueById(id);
      
      // Send email notification to issue creator (if not the commenter)
      if (issue.employee_uuid !== req.user.id) {
        try {
          await enhancedEmailService.sendNewCommentEmail(
            issue.employee_email,
            issue.employee_name,
            issue,
            { content },
            req.user.name
          );
          console.log('Comment notification email sent successfully');
        } catch (emailError) {
          console.error('Comment email failed:', emailError);
        }
      }

      // Send real-time notification
      realTimeService.notifyNewComment(
        id,
        issue.employee_uuid,
        {
          commentId,
          content,
          commenterName: req.user.name,
          commenterRole: req.user.role
        }
      );

      res.status(201).json({
        success: true,
        commentId,
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

      const commentId = await issueService.addInternalComment(id, req.user.id, content);
      
      if (!commentId) {
        return res.status(500).json({
          success: false,
          error: 'Failed to add internal comment'
        });
      }

      // Send real-time notification to other admin users
      realTimeService.broadcast('internal_comment_added', {
        issueId: id,
        commentId,
        content,
        commenterName: req.user.name,
        timestamp: new Date().toISOString()
      });

      res.status(201).json({
        success: true,
        commentId,
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
}

module.exports = new IssueController();
