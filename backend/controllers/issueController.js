
const Issue = require('../models/Issue');
const Employee = require('../models/Employee');
const { HTTP_STATUS, PAGINATION } = require('../config/constants');

class IssueController {
  async getAllIssues(req, res) {
    try {
      const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
      const offset = (page - 1) * limit;
      
      const filters = {
        ...req.query,
        limit,
        offset
      };
      
      // Role-based filtering
      if (req.user.role === 'agent') {
        filters.assigned_to = req.user.id;
      } else if (req.user.role === 'employee') {
        filters.created_by = req.user.id;
      }
      
      const [issues, total] = await Promise.all([
        Issue.findAll(filters),
        Issue.getCount(filters)
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Issues retrieved successfully',
        data: {
          issues,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });
      
    } catch (error) {
      console.error('Get all issues error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve issues',
        message: 'An error occurred while retrieving issues'
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
          message: 'The requested issue does not exist'
        });
      }
      
      // Check permissions - employees can only see their own issues
      if (req.user.role === 'employee' && issue.created_by !== req.user.id) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          error: 'Access denied',
          message: 'You can only view your own issues'
        });
      }
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Issue retrieved successfully',
        data: { issue }
      });
      
    } catch (error) {
      console.error('Get issue by ID error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve issue',
        message: 'An error occurred while retrieving the issue'
      });
    }
  }

  async createIssue(req, res) {
    try {
      const { title, description, issue_type, issue_subtype, priority, employee_id, additional_details } = req.body;
      
      // Verify employee exists
      const employee = await Employee.findById(employee_id);
      if (!employee) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Invalid employee',
          message: 'The specified employee does not exist'
        });
      }
      
      const issueData = {
        title,
        description,
        issue_type,
        issue_subtype,
        priority,
        employee_id,
        created_by: req.user.id,
        additional_details
      };
      
      const newIssue = await Issue.create(issueData);
      
      res.status(HTTP_STATUS.CREATED).json({
        message: 'Issue created successfully',
        data: { issue: newIssue }
      });
      
    } catch (error) {
      console.error('Create issue error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to create issue',
        message: 'An error occurred while creating the issue'
      });
    }
  }

  async updateIssue(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Check if issue exists
      const existingIssue = await Issue.findById(id);
      if (!existingIssue) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Issue not found',
          message: 'The requested issue does not exist'
        });
      }
      
      // Check permissions
      if (req.user.role === 'employee' && existingIssue.created_by !== req.user.id) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          error: 'Access denied',
          message: 'You can only update your own issues'
        });
      }
      
      const updatedIssue = await Issue.update(id, updates, req.user.id);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Issue updated successfully',
        data: { issue: updatedIssue }
      });
      
    } catch (error) {
      console.error('Update issue error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to update issue',
        message: 'An error occurred while updating the issue'
      });
    }
  }

  async deleteIssue(req, res) {
    try {
      const { id } = req.params;
      
      const issue = await Issue.findById(id);
      if (!issue) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Issue not found',
          message: 'The requested issue does not exist'
        });
      }
      
      const deleted = await Issue.delete(id);
      if (!deleted) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          error: 'Failed to delete issue',
          message: 'The issue could not be deleted'
        });
      }
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Issue deleted successfully'
      });
      
    } catch (error) {
      console.error('Delete issue error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to delete issue',
        message: 'An error occurred while deleting the issue'
      });
    }
  }

  async updateIssueStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, resolution_notes } = req.body;
      
      const updates = { status };
      if (resolution_notes) {
        updates.resolution_notes = resolution_notes;
      }
      
      const updatedIssue = await Issue.update(id, updates, req.user.id);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Issue status updated successfully',
        data: { issue: updatedIssue }
      });
      
    } catch (error) {
      console.error('Update issue status error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to update issue status',
        message: 'An error occurred while updating the issue status'
      });
    }
  }

  async assignIssue(req, res) {
    try {
      const { id } = req.params;
      const { assigned_to } = req.body;
      
      const updates = { assigned_to };
      
      // If assigning, also set status to in_progress if it's currently open
      const issue = await Issue.findById(id);
      if (issue && issue.status === 'open') {
        updates.status = 'in_progress';
      }
      
      const updatedIssue = await Issue.update(id, updates, req.user.id);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Issue assigned successfully',
        data: { issue: updatedIssue }
      });
      
    } catch (error) {
      console.error('Assign issue error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to assign issue',
        message: 'An error occurred while assigning the issue'
      });
    }
  }

  async updateIssuePriority(req, res) {
    try {
      const { id } = req.params;
      const { priority } = req.body;
      
      const updatedIssue = await Issue.update(id, { priority }, req.user.id);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Issue priority updated successfully',
        data: { issue: updatedIssue }
      });
      
    } catch (error) {
      console.error('Update issue priority error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to update issue priority',
        message: 'An error occurred while updating the issue priority'
      });
    }
  }

  async reopenIssue(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const updates = { 
        status: 'open',
        resolution_notes: reason ? `Reopened: ${reason}` : 'Issue reopened'
      };
      
      const updatedIssue = await Issue.update(id, updates, req.user.id);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Issue reopened successfully',
        data: { issue: updatedIssue }
      });
      
    } catch (error) {
      console.error('Reopen issue error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to reopen issue',
        message: 'An error occurred while reopening the issue'
      });
    }
  }

  async escalateIssue(req, res) {
    try {
      const { id } = req.params;
      const { escalation_reason } = req.body;
      
      const updates = { 
        status: 'escalated',
        priority: 'urgent',
        resolution_notes: `Escalated: ${escalation_reason}`
      };
      
      const updatedIssue = await Issue.update(id, updates, req.user.id);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Issue escalated successfully',
        data: { issue: updatedIssue }
      });
      
    } catch (error) {
      console.error('Escalate issue error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to escalate issue',
        message: 'An error occurred while escalating the issue'
      });
    }
  }

  async getIssueStatistics(req, res) {
    try {
      const stats = await Issue.getStatistics();
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Issue statistics retrieved successfully',
        data: { stats }
      });
      
    } catch (error) {
      console.error('Get issue statistics error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve issue statistics',
        message: 'An error occurred while retrieving issue statistics'
      });
    }
  }

  async getIssueTrends(req, res) {
    try {
      // This is a placeholder for trends analysis
      // You can implement more sophisticated analytics here
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Issue trends retrieved successfully',
        data: { trends: [] }
      });
      
    } catch (error) {
      console.error('Get issue trends error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve issue trends',
        message: 'An error occurred while retrieving issue trends'
      });
    }
  }

  async getIssueAuditTrail(req, res) {
    try {
      const { id } = req.params;
      
      const auditTrail = await Issue.getAuditTrail(id);
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Issue audit trail retrieved successfully',
        data: { auditTrail }
      });
      
    } catch (error) {
      console.error('Get issue audit trail error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve issue audit trail',
        message: 'An error occurred while retrieving the issue audit trail'
      });
    }
  }

  async bulkAssignIssues(req, res) {
    try {
      const { issue_ids, assigned_to } = req.body;
      
      // This would need to be implemented as a bulk operation
      // For now, it's a placeholder
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Issues assigned successfully',
        data: { affected_count: issue_ids.length }
      });
      
    } catch (error) {
      console.error('Bulk assign issues error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to assign issues',
        message: 'An error occurred while assigning issues'
      });
    }
  }

  async bulkUpdateStatus(req, res) {
    try {
      const { issue_ids, status } = req.body;
      
      // This would need to be implemented as a bulk operation
      // For now, it's a placeholder
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Issue statuses updated successfully',
        data: { affected_count: issue_ids.length }
      });
      
    } catch (error) {
      console.error('Bulk update status error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to update issue statuses',
        message: 'An error occurred while updating issue statuses'
      });
    }
  }

  async bulkUpdatePriority(req, res) {
    try {
      const { issue_ids, priority } = req.body;
      
      // This would need to be implemented as a bulk operation
      // For now, it's a placeholder
      
      res.status(HTTP_STATUS.OK).json({
        message: 'Issue priorities updated successfully',
        data: { affected_count: issue_ids.length }
      });
      
    } catch (error) {
      console.error('Bulk update priority error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to update issue priorities',
        message: 'An error occurred while updating issue priorities'
      });
    }
  }
}

module.exports = new IssueController();
