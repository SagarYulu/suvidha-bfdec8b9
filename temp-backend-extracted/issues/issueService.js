
// Issue Service Logic
// Original files: src/services/issues/issueCore.ts, src/services/issues/issueFetchService.ts

class IssueService {
  constructor(dbConnection) {
    this.db = dbConnection;
  }

  async getIssueById(id) {
    try {
      // Get the issue from the database
      const issue = await this.db.query(
        'SELECT * FROM issues WHERE id = ?',
        [id]
      );
      
      if (!issue) {
        console.error('Issue not found');
        return undefined;
      }
      
      // Get comments for this issue
      const comments = await this.db.query(
        'SELECT * FROM issue_comments WHERE issue_id = ? ORDER BY created_at ASC',
        [id]
      );
      
      // Map comments to the expected format
      const formattedComments = comments ? comments.map(comment => ({
        id: comment.id,
        employeeUuid: comment.employee_uuid,
        content: comment.content,
        createdAt: comment.created_at
      })) : [];
      
      // Map database issue to app Issue type
      return this.mapDbIssueToAppIssue(issue, formattedComments);
    } catch (error) {
      console.error('Error in getIssueById:', error);
      return undefined;
    }
  }

  async getIssuesByUserId(employeeUuid) {
    try {
      // Get user issues from the database
      const issues = await this.db.query(
        'SELECT * FROM issues WHERE employee_uuid = ? ORDER BY created_at DESC',
        [employeeUuid]
      );
      
      if (!issues) {
        console.error('Error fetching user issues');
        return [];
      }
      
      // Process issues with comments and return
      return await this.processIssues(issues);
    } catch (error) {
      console.error('Error in getIssuesByUserId:', error);
      return [];
    }
  }

  async createIssue(issueData) {
    try {
      const issueId = this.generateUUID();
      
      const result = await this.db.query(
        `INSERT INTO issues (
          id, employee_uuid, type_id, sub_type_id, description, 
          status, priority, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          issueId,
          issueData.employeeUuid,
          issueData.typeId,
          issueData.subTypeId,
          issueData.description,
          issueData.status || 'open',
          issueData.priority || 'medium'
        ]
      );

      if (result) {
        // Log audit trail
        await this.logAuditTrail(
          issueId,
          issueData.employeeUuid,
          'issue_created',
          undefined,
          undefined,
          { issue_type: issueData.typeId, issue_subtype: issueData.subTypeId }
        );

        return issueId;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating issue:', error);
      return null;
    }
  }

  async updateIssueStatus(issueId, newStatus, employeeUuid) {
    try {
      // Get current issue
      const currentIssue = await this.getIssueById(issueId);
      if (!currentIssue) {
        throw new Error('Issue not found');
      }

      const previousStatus = currentIssue.status;
      
      // Update the issue status
      await this.db.query(
        'UPDATE issues SET status = ?, updated_at = NOW() WHERE id = ?',
        [newStatus, issueId]
      );

      // Log audit trail
      await this.logAuditTrail(
        issueId,
        employeeUuid,
        'status_changed',
        previousStatus,
        newStatus
      );

      return true;
    } catch (error) {
      console.error('Error updating issue status:', error);
      return false;
    }
  }

  async addComment(issueId, employeeUuid, content) {
    try {
      const commentId = this.generateUUID();
      
      await this.db.query(
        'INSERT INTO issue_comments (id, issue_id, employee_uuid, content, created_at) VALUES (?, ?, ?, ?, NOW())',
        [commentId, issueId, employeeUuid, content]
      );

      // Log audit trail
      await this.logAuditTrail(
        issueId,
        employeeUuid,
        'comment_added',
        undefined,
        undefined,
        { comment_id: commentId }
      );

      return commentId;
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  }

  mapDbIssueToAppIssue(dbIssue, comments) {
    return {
      id: dbIssue.id,
      employeeUuid: dbIssue.employee_uuid,
      typeId: dbIssue.type_id,
      subTypeId: dbIssue.sub_type_id,
      description: dbIssue.description,
      status: dbIssue.status,
      priority: dbIssue.priority,
      createdAt: dbIssue.created_at,
      updatedAt: dbIssue.updated_at,
      closedAt: dbIssue.closed_at,
      assignedTo: dbIssue.assigned_to,
      comments: comments,
      lastStatusChangeAt: dbIssue.last_status_change_at,
      reopenableUntil: dbIssue.reopenable_until,
      previouslyClosedAt: dbIssue.previously_closed_at
    };
  }

  async processIssues(dbIssues) {
    const processedIssues = [];
    
    for (const issue of dbIssues) {
      // Get comments for each issue
      const comments = await this.db.query(
        'SELECT * FROM issue_comments WHERE issue_id = ? ORDER BY created_at ASC',
        [issue.id]
      );
      
      const formattedComments = comments ? comments.map(comment => ({
        id: comment.id,
        employeeUuid: comment.employee_uuid,
        content: comment.content,
        createdAt: comment.created_at
      })) : [];
      
      processedIssues.push(this.mapDbIssueToAppIssue(issue, formattedComments));
    }
    
    return processedIssues;
  }

  async logAuditTrail(issueId, employeeUuid, action, previousStatus, newStatus, details) {
    try {
      await this.db.query(
        'INSERT INTO issue_audit_trail (issue_id, employee_uuid, action, previous_status, new_status, details, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [issueId, employeeUuid, action, previousStatus, newStatus, JSON.stringify(details || {})]
      );
    } catch (error) {
      console.error('Error logging audit trail:', error);
    }
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

module.exports = { IssueService };
