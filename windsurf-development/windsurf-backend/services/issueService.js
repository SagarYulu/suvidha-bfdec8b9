
const db = require('../config/database');
const auditService = require('./auditService');
const notificationService = require('./notificationService');
const { v4: uuidv4 } = require('uuid');

class IssueService {
  // Create new issue with full business logic
  async createIssue(issueData, userId) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const issueId = uuidv4();
      
      // Validate required fields
      if (!issueData.type_id || !issueData.sub_type_id || !issueData.description) {
        throw new Error('Missing required fields: type_id, sub_type_id, description');
      }
      
      // Insert issue
      await connection.execute(`
        INSERT INTO issues (
          id, employee_uuid, type_id, sub_type_id, description, 
          priority, status, attachments, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'open', ?, NOW(), NOW())
      `, [
        issueId,
        issueData.employee_uuid || userId,
        issueData.type_id,
        issueData.sub_type_id,
        issueData.description,
        issueData.priority || 'medium',
        JSON.stringify(issueData.attachments || [])
      ]);
      
      // Log audit trail
      await auditService.logAction({
        issueId,
        userId,
        action: 'issue_created',
        details: { type_id: issueData.type_id, sub_type_id: issueData.sub_type_id }
      }, connection);
      
      // Send notification to relevant users
      await notificationService.notifyIssueCreated(issueId, userId);
      
      await connection.commit();
      return issueId;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Update issue status with validation
  async updateIssueStatus(issueId, newStatus, userId, comment = null) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get current issue
      const [currentIssue] = await connection.execute(
        'SELECT * FROM issues WHERE id = ?', [issueId]
      );
      
      if (currentIssue.length === 0) {
        throw new Error('Issue not found');
      }
      
      const issue = currentIssue[0];
      const previousStatus = issue.status;
      
      // Validate status transition
      if (!this.isValidStatusTransition(previousStatus, newStatus)) {
        throw new Error(`Invalid status transition from ${previousStatus} to ${newStatus}`);
      }
      
      // Update issue
      const updateData = {
        status: newStatus,
        updated_at: new Date()
      };
      
      if (newStatus === 'closed' || newStatus === 'resolved') {
        updateData.closed_at = new Date();
      }
      
      await connection.execute(`
        UPDATE issues 
        SET status = ?, updated_at = ?, closed_at = ?
        WHERE id = ?
      `, [newStatus, updateData.updated_at, updateData.closed_at || null, issueId]);
      
      // Add comment if provided
      if (comment) {
        await connection.execute(`
          INSERT INTO issue_comments (id, issue_id, employee_uuid, content, created_at)
          VALUES (?, ?, ?, ?, NOW())
        `, [uuidv4(), issueId, userId, comment]);
      }
      
      // Log audit trail
      await auditService.logAction({
        issueId,
        userId,
        action: 'status_changed',
        previousStatus,
        newStatus,
        details: { comment }
      }, connection);
      
      // Send notifications
      await notificationService.notifyStatusChange(issueId, previousStatus, newStatus, userId);
      
      await connection.commit();
      return true;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Assign issue to user
  async assignIssue(issueId, assigneeId, userId) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get current issue
      const [currentIssue] = await connection.execute(
        'SELECT assigned_to FROM issues WHERE id = ?', [issueId]
      );
      
      if (currentIssue.length === 0) {
        throw new Error('Issue not found');
      }
      
      const previousAssignee = currentIssue[0].assigned_to;
      
      // Update assignment
      await connection.execute(`
        UPDATE issues 
        SET assigned_to = ?, updated_at = NOW()
        WHERE id = ?
      `, [assigneeId, issueId]);
      
      // Log audit trail
      await auditService.logAction({
        issueId,
        userId,
        action: 'issue_assigned',
        details: { previousAssignee, newAssignee: assigneeId }
      }, connection);
      
      // Send notifications
      await notificationService.notifyAssignment(issueId, assigneeId, userId);
      
      await connection.commit();
      return true;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Validate status transitions
  isValidStatusTransition(fromStatus, toStatus) {
    const validTransitions = {
      'open': ['in_progress', 'closed'],
      'in_progress': ['resolved', 'closed', 'open'],
      'resolved': ['closed', 'open'],
      'closed': ['open'] // Allow reopening
    };
    
    return validTransitions[fromStatus]?.includes(toStatus) || false;
  }
  
  // Get issue with full details
  async getIssueDetails(issueId, userId, userRole) {
    try {
      // Get issue with employee and assignee details
      const [issues] = await db.execute(`
        SELECT 
          i.*,
          e.name as employee_name,
          e.email as employee_email,
          e.phone as employee_phone,
          e.manager,
          e.city,
          e.cluster,
          au.name as assigned_user_name
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        LEFT JOIN dashboard_users au ON i.assigned_to = au.id
        WHERE i.id = ?
      `, [issueId]);
      
      if (issues.length === 0) {
        throw new Error('Issue not found');
      }
      
      const issue = issues[0];
      
      // Check access permissions
      if (userRole === 'employee' && issue.employee_uuid !== userId) {
        throw new Error('Access denied');
      }
      
      // Get comments
      const [comments] = await db.execute(`
        SELECT 
          c.*,
          COALESCE(e.name, du.name) as commenter_name
        FROM issue_comments c
        LEFT JOIN employees e ON c.employee_uuid = e.id
        LEFT JOIN dashboard_users du ON c.employee_uuid = du.id
        WHERE c.issue_id = ?
        ORDER BY c.created_at ASC
      `, [issueId]);
      
      // Get internal comments (admin only)
      let internalComments = [];
      if (userRole !== 'employee') {
        const [internal] = await db.execute(`
          SELECT 
            ic.*,
            du.name as commenter_name
          FROM issue_internal_comments ic
          LEFT JOIN dashboard_users du ON ic.employee_uuid = du.id
          WHERE ic.issue_id = ?
          ORDER BY ic.created_at ASC
        `, [issueId]);
        internalComments = internal;
      }
      
      // Get audit trail
      const [auditTrail] = await db.execute(`
        SELECT 
          at.*,
          COALESCE(e.name, du.name) as performer_name
        FROM issue_audit_trail at
        LEFT JOIN employees e ON at.employee_uuid = e.id
        LEFT JOIN dashboard_users du ON at.employee_uuid = du.id
        WHERE at.issue_id = ?
        ORDER BY at.created_at DESC
      `, [issueId]);
      
      return {
        issue,
        comments,
        internalComments,
        auditTrail
      };
      
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new IssueService();
