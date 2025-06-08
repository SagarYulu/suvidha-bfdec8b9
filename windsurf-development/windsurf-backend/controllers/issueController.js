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
        createdBy: req.user.id,
        // Auto-assign priority based on type if not provided
        priority: req.body.priority || this.determinePriority(req.body.type_id),
        // Set initial status
        status: 'open'
      };

      const issueId = await issueService.createIssue(issueData);
      
      if (!issueId) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create issue'
        });
      }

      // Get the created issue for response
      const issue = await issueService.getIssueById(issueId);

      // Send email notification
      try {
        await enhancedEmailService.sendIssueCreatedEmail(
          issue.employee_email,
          issue.employee_name,
          issue
        );
      } catch (emailError) {
        console.error('Failed to send issue creation email:', emailError);
        // Don't fail the request if email fails
      }

      // Send real-time notification
      realTimeService.broadcast('issue_created', {
        issue,
        timestamp: new Date().toISOString()
      });

      // Log audit trail
      await this.logAuditTrail(issueId, req.user.id, 'issue_created', {
        priority: issue.priority,
        type: issue.type_id,
        status: issue.status
      });

      res.status(201).json({
        success: true,
        issue,
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

      // Check SLA breach if status is changing to resolved/closed
      if (updateData.status && ['resolved', 'closed'].includes(updateData.status)) {
        const slaCheck = await tatService.checkSLABreach(id);
        if (slaCheck && slaCheck.isBreached) {
          updateData.sla_breached = true;
          updateData.breach_hours = slaCheck.hours_open;
        }
        
        // Set closed_at timestamp
        if (updateData.status === 'closed') {
          updateData.closed_at = new Date();
        }
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

      // Log audit trail
      await this.logAuditTrail(id, req.user.id, 'issue_updated', {
        changes: updateData,
        previous_status: currentIssue.status,
        new_status: updateData.status
      });

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

      // Log audit trail
      await this.logAuditTrail(id, req.user.id, 'issue_assigned', {
        assigned_to: assignedTo,
        previous_assignee: issue.assigned_to
      });

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

  // Helper method to determine priority based on issue type
  determinePriority(typeId) {
    const criticalTypes = ['system_down', 'security_breach', 'data_loss'];
    const highTypes = ['performance_issue', 'login_problem', 'payment_issue'];
    const lowTypes = ['feature_request', 'documentation', 'question'];
    
    if (criticalTypes.includes(typeId)) return 'critical';
    if (highTypes.includes(typeId)) return 'high';
    if (lowTypes.includes(typeId)) return 'low';
    
    return 'medium'; // default
  }

  // Helper method to get fallback assignee
  async getFallbackAssignee(issue) {
    try {
      // Logic: Assign to least busy agent in the same city
      const query = `
        SELECT assigned_to, COUNT(*) as workload
        FROM issues 
        WHERE status IN ('open', 'in_progress') 
          AND city = ?
          AND assigned_to IS NOT NULL
        GROUP BY assigned_to
        ORDER BY workload ASC
        LIMIT 1
      `;
      
      const [rows] = await db.execute(query, [issue.city || 'default']);
      
      if (rows.length > 0) {
        return rows[0].assigned_to;
      }
      
      // If no agents found, assign to default admin
      return 'admin_user_id'; // This should be configurable
    } catch (error) {
      console.error('Error getting fallback assignee:', error);
      return null;
    }
  }

  // Helper method to log audit trail
  async logAuditTrail(issueId, userId, action, details = {}) {
    try {
      const query = `
        INSERT INTO issue_audit_trail (issue_id, employee_uuid, action, details, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `;
      
      await db.execute(query, [
        issueId,
        userId,
        action,
        JSON.stringify(details)
      ]);
    } catch (error) {
      console.error('Error logging audit trail:', error);
      // Don't throw error as this is not critical for main operation
    }
  }

  // New method to get SLA breaches
  async getSLABreaches(req, res) {
    try {
      const slaThreshold = req.query.threshold || 48; // hours
      const breaches = await tatService.getSLABreaches(slaThreshold);
      
      res.json({
        success: true,
        breaches,
        threshold: slaThreshold
      });
    } catch (error) {
      console.error('Get SLA breaches error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get SLA breaches'
      });
    }
  }

  // New method to get issue audit trail
  async getIssueAuditTrail(req, res) {
    try {
      const { id } = req.params;
      const { limit = 50 } = req.query;
      
      const query = `
        SELECT 
          iat.*,
          e.name as performer_name,
          e.email as performer_email
        FROM issue_audit_trail iat
        LEFT JOIN employees e ON iat.employee_uuid = e.user_id
        WHERE iat.issue_id = ?
        ORDER BY iat.created_at DESC
        LIMIT ?
      `;
      
      const [rows] = await db.execute(query, [id, parseInt(limit)]);
      
      res.json({
        success: true,
        auditTrail: rows
      });
    } catch (error) {
      console.error('Get audit trail error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get audit trail'
      });
    }
  }
}

module.exports = new IssueController();
