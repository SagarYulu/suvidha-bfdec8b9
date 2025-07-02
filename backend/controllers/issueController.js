
const Issue = require('../models/Issue');
const Employee = require('../models/Employee');
const auditService = require('../services/auditService');
const { HTTP_STATUS } = require('../config/constants');

class IssueController {
  async getAllIssues(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        priority, 
        assigned_to, 
        city, 
        cluster,
        startDate,
        endDate
      } = req.query;

      const filters = {
        status,
        priority,
        assigned_to,
        city,
        cluster,
        startDate,
        endDate
      };

      const issues = await Issue.findAll(filters, parseInt(page), parseInt(limit));
      const total = await Issue.count(filters);

      res.status(HTTP_STATUS.OK).json({
        message: 'Issues retrieved successfully',
        data: {
          issues,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all issues error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve issues',
        message: error.message
      });
    }
  }

  async getIssueById(req, res) {
    try {
      const { id } = req.params;
      const issue = await Issue.findById(id);
      
      if (!issue) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Issue not found',
          message: 'Issue with the provided ID does not exist'
        });
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'Issue retrieved successfully',
        data: issue
      });
    } catch (error) {
      console.error('Get issue by ID error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve issue',
        message: error.message
      });
    }
  }

  async createIssue(req, res) {
    try {
      const issueData = req.body;
      const issue = await Issue.create(issueData);

      // Log audit trail
      await auditService.logIssueAudit(
        issue.id,
        'created',
        { issue: issueData },
        req.user.id,
        req
      );

      res.status(HTTP_STATUS.CREATED).json({
        message: 'Issue created successfully',
        data: issue
      });
    } catch (error) {
      console.error('Create issue error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to create issue',
        message: error.message
      });
    }
  }

  async updateIssue(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const originalIssue = await Issue.findById(id);
      if (!originalIssue) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Issue not found'
        });
      }

      const updatedIssue = await Issue.update(id, updates);

      // Log audit trail
      await auditService.logIssueAudit(
        id,
        'updated',
        { 
          original: originalIssue,
          updates: updates
        },
        req.user.id,
        req
      );

      res.status(HTTP_STATUS.OK).json({
        message: 'Issue updated successfully',
        data: updatedIssue
      });
    } catch (error) {
      console.error('Update issue error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to update issue',
        message: error.message
      });
    }
  }

  async deleteIssue(req, res) {
    try {
      const { id } = req.params;
      
      const issue = await Issue.findById(id);
      if (!issue) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Issue not found'
        });
      }

      await Issue.delete(id);

      // Log audit trail
      await auditService.logIssueAudit(
        id,
        'deleted',
        { deleted_issue: issue },
        req.user.id,
        req
      );

      res.status(HTTP_STATUS.OK).json({
        message: 'Issue deleted successfully'
      });
    } catch (error) {
      console.error('Delete issue error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to delete issue',
        message: error.message
      });
    }
  }

  async updateIssueStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const issue = await Issue.findById(id);
      if (!issue) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Issue not found'
        });
      }

      const updatedIssue = await Issue.updateStatus(id, status);

      // Log audit trail
      await auditService.logIssueAudit(
        id,
        'status_changed',
        { 
          previous_status: issue.status,
          new_status: status
        },
        req.user.id,
        req
      );

      res.status(HTTP_STATUS.OK).json({
        message: 'Issue status updated successfully',
        data: updatedIssue
      });
    } catch (error) {
      console.error('Update issue status error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to update issue status',
        message: error.message
      });
    }
  }

  async assignIssue(req, res) {
    try {
      const { id } = req.params;
      const { assigned_to } = req.body;

      const issue = await Issue.findById(id);
      if (!issue) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Issue not found'
        });
      }

      const updatedIssue = await Issue.updateAssignment(id, assigned_to);

      // Log audit trail
      await auditService.logIssueAudit(
        id,
        'assigned',
        { 
          previous_assignee: issue.assigned_to,
          new_assignee: assigned_to
        },
        req.user.id,
        req
      );

      res.status(HTTP_STATUS.OK).json({
        message: 'Issue assigned successfully',
        data: updatedIssue
      });
    } catch (error) {
      console.error('Assign issue error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to assign issue',
        message: error.message
      });
    }
  }

  async updateIssuePriority(req, res) {
    try {
      const { id } = req.params;
      const { priority } = req.body;

      const issue = await Issue.findById(id);
      if (!issue) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Issue not found'
        });
      }

      const updatedIssue = await Issue.updatePriority(id, priority);

      // Log audit trail
      await auditService.logIssueAudit(
        id,
        'priority_changed',
        { 
          previous_priority: issue.priority,
          new_priority: priority
        },
        req.user.id,
        req
      );

      res.status(HTTP_STATUS.OK).json({
        message: 'Issue priority updated successfully',
        data: updatedIssue
      });
    } catch (error) {
      console.error('Update issue priority error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to update issue priority',
        message: error.message
      });
    }
  }

  async reopenIssue(req, res) {
    try {
      const { id } = req.params;

      const issue = await Issue.findById(id);
      if (!issue) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Issue not found'
        });
      }

      if (issue.status !== 'closed') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Issue is not closed',
          message: 'Only closed issues can be reopened'
        });
      }

      const updatedIssue = await Issue.updateStatus(id, 'open');

      // Log audit trail
      await auditService.logIssueAudit(
        id,
        'reopened',
        { 
          previous_status: issue.status,
          new_status: 'open'
        },
        req.user.id,
        req
      );

      res.status(HTTP_STATUS.OK).json({
        message: 'Issue reopened successfully',
        data: updatedIssue
      });
    } catch (error) {
      console.error('Reopen issue error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to reopen issue',
        message: error.message
      });
    }
  }

  async escalateIssue(req, res) {
    try {
      const { id } = req.params;

      const issue = await Issue.findById(id);
      if (!issue) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Issue not found'
        });
      }

      // Logic to escalate - could involve changing priority or assignment
      const updates = {
        priority: 'high',
        status: 'escalated'
      };

      const updatedIssue = await Issue.update(id, updates);

      // Log audit trail
      await auditService.logIssueAudit(
        id,
        'escalated',
        { escalation_reason: req.body.reason || 'Manual escalation' },
        req.user.id,
        req
      );

      res.status(HTTP_STATUS.OK).json({
        message: 'Issue escalated successfully',
        data: updatedIssue
      });
    } catch (error) {
      console.error('Escalate issue error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to escalate issue',
        message: error.message
      });
    }
  }

  async getIssueStatistics(req, res) {
    try {
      const stats = await Issue.getStatistics();
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Issue statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Get issue statistics error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve issue statistics',
        message: error.message
      });
    }
  }

  async getIssueTrends(req, res) {
    try {
      const { period = '30d' } = req.query;
      const trends = await Issue.getTrends(period);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Issue trends retrieved successfully',
        data: trends
      });
    } catch (error) {
      console.error('Get issue trends error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve issue trends',
        message: error.message
      });
    }
  }

  async getIssueAuditTrail(req, res) {
    try {
      const { id } = req.params;
      const auditLogs = await auditService.getAuditLogs({
        entity_type: 'issue',
        entity_id: id
      });
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Issue audit trail retrieved successfully',
        data: auditLogs
      });
    } catch (error) {
      console.error('Get issue audit trail error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve issue audit trail',
        message: error.message
      });
    }
  }

  async bulkAssignIssues(req, res) {
    try {
      const { issue_ids, assigned_to } = req.body;
      
      const results = await Promise.all(
        issue_ids.map(id => Issue.updateAssignment(id, assigned_to))
      );

      // Log audit trails
      await Promise.all(
        issue_ids.map(id => 
          auditService.logIssueAudit(
            id,
            'bulk_assigned',
            { assigned_to },
            req.user.id,
            req
          )
        )
      );

      res.status(HTTP_STATUS.OK).json({
        message: 'Issues assigned successfully',
        data: { updated_count: results.length }
      });
    } catch (error) {
      console.error('Bulk assign issues error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to assign issues',
        message: error.message
      });
    }
  }

  async bulkUpdateStatus(req, res) {
    try {
      const { issue_ids, status } = req.body;
      
      const results = await Promise.all(
        issue_ids.map(id => Issue.updateStatus(id, status))
      );

      // Log audit trails
      await Promise.all(
        issue_ids.map(id => 
          auditService.logIssueAudit(
            id,
            'bulk_status_update',
            { new_status: status },
            req.user.id,
            req
          )
        )
      );

      res.status(HTTP_STATUS.OK).json({
        message: 'Issue statuses updated successfully',
        data: { updated_count: results.length }
      });
    } catch (error) {
      console.error('Bulk update status error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to update issue statuses',
        message: error.message
      });
    }
  }

  async bulkUpdatePriority(req, res) {
    try {
      const { issue_ids, priority } = req.body;
      
      const results = await Promise.all(
        issue_ids.map(id => Issue.updatePriority(id, priority))
      );

      // Log audit trails
      await Promise.all(
        issue_ids.map(id => 
          auditService.logIssueAudit(
            id,
            'bulk_priority_update',
            { new_priority: priority },
            req.user.id,
            req
          )
        )
      );

      res.status(HTTP_STATUS.OK).json({
        message: 'Issue priorities updated successfully',
        data: { updated_count: results.length }
      });
    } catch (error) {
      console.error('Bulk update priority error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to update issue priorities',
        message: error.message
      });
    }
  }
}

module.exports = new IssueController();
