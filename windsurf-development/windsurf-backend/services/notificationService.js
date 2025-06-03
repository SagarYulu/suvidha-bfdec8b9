
const db = require('../config/database');
const emailService = require('./emailService');
const { v4: uuidv4 } = require('uuid');

class NotificationService {
  async notifyIssueCreated(issueId, createdBy) {
    try {
      // Get issue details
      const [issues] = await db.execute(`
        SELECT i.*, e.name as employee_name, e.email as employee_email
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE i.id = ?
      `, [issueId]);
      
      if (issues.length === 0) return;
      
      const issue = issues[0];
      
      // Get admin users to notify
      const [admins] = await db.execute(`
        SELECT email, name FROM dashboard_users 
        WHERE role IN ('admin', 'security-admin')
      `);
      
      // Create in-app notifications
      for (const admin of admins) {
        await this.createInAppNotification(
          admin.id || uuidv4(), // Use proper admin ID
          issueId,
          `New issue created by ${issue.employee_name}: ${issue.type_id}`
        );
      }
      
      // Send email notifications
      const emailContent = {
        subject: `New Issue Created - ${issue.type_id}`,
        html: `
          <h2>New Issue Created</h2>
          <p><strong>Issue ID:</strong> ${issueId}</p>
          <p><strong>Employee:</strong> ${issue.employee_name} (${issue.employee_email})</p>
          <p><strong>Type:</strong> ${issue.type_id}</p>
          <p><strong>Sub Type:</strong> ${issue.sub_type_id}</p>
          <p><strong>Priority:</strong> ${issue.priority}</p>
          <p><strong>Description:</strong> ${issue.description}</p>
          <p><strong>Created:</strong> ${new Date(issue.created_at).toLocaleString()}</p>
        `
      };
      
      for (const admin of admins) {
        await emailService.sendEmail(admin.email, emailContent.subject, emailContent.html);
      }
      
    } catch (error) {
      console.error('Error sending issue created notifications:', error);
    }
  }
  
  async notifyStatusChange(issueId, previousStatus, newStatus, changedBy) {
    try {
      // Get issue details
      const [issues] = await db.execute(`
        SELECT i.*, e.name as employee_name, e.email as employee_email
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE i.id = ?
      `, [issueId]);
      
      if (issues.length === 0) return;
      
      const issue = issues[0];
      
      // Notify issue creator
      await this.createInAppNotification(
        issue.employee_uuid,
        issueId,
        `Your issue status changed from ${previousStatus} to ${newStatus}`
      );
      
      // Notify assigned user if different
      if (issue.assigned_to && issue.assigned_to !== issue.employee_uuid) {
        await this.createInAppNotification(
          issue.assigned_to,
          issueId,
          `Issue status changed from ${previousStatus} to ${newStatus}`
        );
      }
      
      // Send email to issue creator
      const emailContent = {
        subject: `Issue Status Update - ${issue.type_id}`,
        html: `
          <h2>Issue Status Updated</h2>
          <p><strong>Issue ID:</strong> ${issueId}</p>
          <p><strong>Previous Status:</strong> ${previousStatus}</p>
          <p><strong>New Status:</strong> ${newStatus}</p>
          <p><strong>Type:</strong> ${issue.type_id}</p>
          <p><strong>Description:</strong> ${issue.description}</p>
        `
      };
      
      await emailService.sendEmail(issue.employee_email, emailContent.subject, emailContent.html);
      
    } catch (error) {
      console.error('Error sending status change notifications:', error);
    }
  }
  
  async notifyAssignment(issueId, assigneeId, assignedBy) {
    try {
      // Get issue and assignee details
      const [issues] = await db.execute(`
        SELECT i.*, e.name as employee_name, du.name as assignee_name, du.email as assignee_email
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        LEFT JOIN dashboard_users du ON du.id = ?
        WHERE i.id = ?
      `, [assigneeId, issueId]);
      
      if (issues.length === 0) return;
      
      const issue = issues[0];
      
      // Create in-app notification for assignee
      await this.createInAppNotification(
        assigneeId,
        issueId,
        `You have been assigned to issue: ${issue.type_id}`
      );
      
      // Send email to assignee
      const emailContent = {
        subject: `Issue Assigned - ${issue.type_id}`,
        html: `
          <h2>Issue Assigned to You</h2>
          <p><strong>Issue ID:</strong> ${issueId}</p>
          <p><strong>Type:</strong> ${issue.type_id}</p>
          <p><strong>Priority:</strong> ${issue.priority}</p>
          <p><strong>Employee:</strong> ${issue.employee_name}</p>
          <p><strong>Description:</strong> ${issue.description}</p>
          <p><strong>Status:</strong> ${issue.status}</p>
        `
      };
      
      await emailService.sendEmail(issue.assignee_email, emailContent.subject, emailContent.html);
      
    } catch (error) {
      console.error('Error sending assignment notifications:', error);
    }
  }
  
  async createInAppNotification(userId, issueId, content) {
    try {
      await db.execute(`
        INSERT INTO issue_notifications (id, user_id, issue_id, content, created_at, is_read)
        VALUES (?, ?, ?, ?, NOW(), false)
      `, [uuidv4(), userId, issueId, content]);
      
    } catch (error) {
      console.error('Error creating in-app notification:', error);
    }
  }
  
  async markNotificationAsRead(notificationId, userId) {
    try {
      await db.execute(`
        UPDATE issue_notifications 
        SET is_read = true 
        WHERE id = ? AND user_id = ?
      `, [notificationId, userId]);
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }
  
  async getUserNotifications(userId, limit = 50) {
    try {
      const [notifications] = await db.execute(`
        SELECT n.*, i.type_id, i.description
        FROM issue_notifications n
        LEFT JOIN issues i ON n.issue_id = i.id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
        LIMIT ?
      `, [userId, limit]);
      
      return notifications;
      
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }
}

module.exports = new NotificationService();
