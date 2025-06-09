
const nodemailer = require('nodemailer');
const config = require('../config/env');
const NotificationModel = require('../models/Notification');
const { v4: uuidv4 } = require('uuid');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
      }
    });
  }

  async sendEmail(to, subject, htmlContent, textContent = null) {
    try {
      const mailOptions = {
        from: config.smtp.from,
        to,
        subject,
        html: htmlContent,
        text: textContent || this.htmlToText(htmlContent)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendIssueCreatedEmail(issue, employee) {
    const subject = `New Issue Created: ${issue.id}`;
    const htmlContent = this.generateIssueCreatedTemplate(issue, employee);
    
    // Send to assigned agent if any
    if (issue.assigned_to) {
      const assignedUser = await this.getUserById(issue.assigned_to);
      if (assignedUser && assignedUser.email) {
        await this.sendEmail(assignedUser.email, subject, htmlContent);
        
        // Create notification record
        await NotificationModel.create({
          id: uuidv4(),
          user_id: assignedUser.id,
          issue_id: issue.id,
          type: 'issue_created',
          title: 'New Issue Assigned',
          message: `New issue has been assigned to you: ${issue.description.substring(0, 100)}...`,
          sent_via: 'email'
        });
      }
    }

    return { success: true };
  }

  async sendIssueStatusUpdateEmail(issue, oldStatus, newStatus, updatedBy) {
    const subject = `Issue Status Updated: ${issue.id}`;
    const htmlContent = this.generateStatusUpdateTemplate(issue, oldStatus, newStatus, updatedBy);
    
    // Send to issue creator
    const employee = await this.getEmployeeByUuid(issue.employee_uuid);
    if (employee && employee.email) {
      await this.sendEmail(employee.email, subject, htmlContent);
      
      // Create notification
      await NotificationModel.create({
        id: uuidv4(),
        user_id: issue.employee_uuid,
        issue_id: issue.id,
        type: 'status_update',
        title: 'Issue Status Updated',
        message: `Your issue status has been updated from ${oldStatus} to ${newStatus}`,
        sent_via: 'email'
      });
    }

    return { success: true };
  }

  async sendEscalationEmail(escalation, issue) {
    const subject = `Issue Escalated: ${issue.id}`;
    const htmlContent = this.generateEscalationTemplate(escalation, issue);
    
    // Send to escalated user
    if (escalation.escalated_to) {
      const escalatedUser = await this.getUserById(escalation.escalated_to);
      if (escalatedUser && escalatedUser.email) {
        await this.sendEmail(escalatedUser.email, subject, htmlContent);
        
        await NotificationModel.create({
          id: uuidv4(),
          user_id: escalatedUser.id,
          issue_id: issue.id,
          type: 'escalation',
          title: 'Issue Escalated to You',
          message: `An issue has been escalated to you: ${escalation.reason}`,
          sent_via: 'email'
        });
      }
    }

    return { success: true };
  }

  async sendCommentNotificationEmail(comment, issue) {
    const subject = `New Comment on Issue: ${issue.id}`;
    const htmlContent = this.generateCommentTemplate(comment, issue);
    
    // Send to all stakeholders
    const stakeholders = await this.getIssueStakeholders(issue.id);
    
    for (const stakeholder of stakeholders) {
      if (stakeholder.email && stakeholder.id !== comment.user_id) {
        await this.sendEmail(stakeholder.email, subject, htmlContent);
        
        await NotificationModel.create({
          id: uuidv4(),
          user_id: stakeholder.id,
          issue_id: issue.id,
          type: 'comment_added',
          title: 'New Comment Added',
          message: `A new comment has been added to your issue`,
          sent_via: 'email'
        });
      }
    }

    return { success: true };
  }

  async sendTATWarningEmail(issue, tatInfo) {
    const subject = `TAT Warning: Issue ${issue.id}`;
    const htmlContent = this.generateTATWarningTemplate(issue, tatInfo);
    
    // Send to assigned agent and manager
    const recipients = [];
    
    if (issue.assigned_to) {
      const assignedUser = await this.getUserById(issue.assigned_to);
      if (assignedUser) recipients.push(assignedUser);
    }
    
    // Get manager for escalation
    const managers = await this.getUsersByRole('manager');
    recipients.push(...managers);
    
    for (const recipient of recipients) {
      if (recipient.email) {
        await this.sendEmail(recipient.email, subject, htmlContent);
      }
    }

    return { success: true };
  }

  generateIssueCreatedTemplate(issue, employee) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333;">New Issue Created</h2>
          <p><strong>Issue ID:</strong> ${issue.id}</p>
          <p><strong>Created by:</strong> ${employee.name} (${employee.email})</p>
          <p><strong>Priority:</strong> ${issue.priority}</p>
          <p><strong>Status:</strong> ${issue.status}</p>
          <p><strong>Description:</strong></p>
          <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 10px 0;">
            ${issue.description}
          </div>
          <p><strong>Created at:</strong> ${new Date(issue.created_at).toLocaleString()}</p>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="${config.frontendUrl}/admin/issues/${issue.id}" 
               style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              View Issue
            </a>
          </div>
        </div>
      </div>
    `;
  }

  generateStatusUpdateTemplate(issue, oldStatus, newStatus, updatedBy) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333;">Issue Status Updated</h2>
          <p><strong>Issue ID:</strong> ${issue.id}</p>
          <p><strong>Status changed from:</strong> <span style="color: #dc3545;">${oldStatus}</span> 
             <strong>to:</strong> <span style="color: #28a745;">${newStatus}</span></p>
          <p><strong>Updated by:</strong> ${updatedBy.name}</p>
          <p><strong>Updated at:</strong> ${new Date().toLocaleString()}</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 10px 0;">
            <strong>Issue Description:</strong><br>
            ${issue.description}
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="${config.frontendUrl}/mobile/issues/${issue.id}" 
               style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              View Issue
            </a>
          </div>
        </div>
      </div>
    `;
  }

  generateEscalationTemplate(escalation, issue) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border: 1px solid #ffeaa7;">
          <h2 style="color: #856404;">Issue Escalated</h2>
          <p><strong>Issue ID:</strong> ${issue.id}</p>
          <p><strong>Escalation Type:</strong> ${escalation.escalation_type}</p>
          <p><strong>Reason:</strong> ${escalation.reason}</p>
          <p><strong>Escalated at:</strong> ${new Date(escalation.escalated_at).toLocaleString()}</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 10px 0;">
            <strong>Issue Description:</strong><br>
            ${issue.description}
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="${config.frontendUrl}/admin/issues/${issue.id}" 
               style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              Handle Escalation
            </a>
          </div>
        </div>
      </div>
    `;
  }

  generateCommentTemplate(comment, issue) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #1565c0;">New Comment Added</h2>
          <p><strong>Issue ID:</strong> ${issue.id}</p>
          <p><strong>Comment by:</strong> ${comment.commenter_name}</p>
          <p><strong>Added at:</strong> ${new Date(comment.created_at).toLocaleString()}</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 10px 0;">
            <strong>Comment:</strong><br>
            ${comment.content}
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="${config.frontendUrl}/admin/issues/${issue.id}" 
               style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              View Full Conversation
            </a>
          </div>
        </div>
      </div>
    `;
  }

  generateTATWarningTemplate(issue, tatInfo) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; border: 1px solid #f44336;">
          <h2 style="color: #c62828;">TAT Warning</h2>
          <p><strong>Issue ID:</strong> ${issue.id}</p>
          <p><strong>Days Elapsed:</strong> ${tatInfo.days_elapsed}</p>
          <p><strong>Status:</strong> <span style="color: #f44336; font-weight: bold;">${tatInfo.status.toUpperCase()}</span></p>
          <p><strong>Issue Priority:</strong> ${issue.priority}</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 10px 0;">
            <strong>Issue Description:</strong><br>
            ${issue.description}
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="${config.frontendUrl}/admin/issues/${issue.id}" 
               style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              Take Action Now
            </a>
          </div>
        </div>
      </div>
    `;
  }

  htmlToText(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  async getUserById(id) {
    // Implementation to get user by ID
    const UserModel = require('../models/User');
    return await UserModel.findById(id);
  }

  async getEmployeeByUuid(uuid) {
    // Implementation to get employee by UUID
    const EmployeeModel = require('../models/Employee');
    return await EmployeeModel.findByUuid(uuid);
  }

  async getUsersByRole(role) {
    // Implementation to get users by role
    const UserModel = require('../models/User');
    return await UserModel.findByRole(role);
  }

  async getIssueStakeholders(issueId) {
    // Implementation to get all stakeholders of an issue
    const IssueModel = require('../models/Issue');
    return await IssueModel.getStakeholders(issueId);
  }
}

module.exports = new EmailService();
