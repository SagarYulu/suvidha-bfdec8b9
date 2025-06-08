
const nodemailer = require('nodemailer');
const { pool } = require('../config/database');

class EnhancedEmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    // Support multiple email providers
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };

    // Fallback to SendGrid if SMTP not configured
    if (!process.env.SMTP_USER && process.env.SENDGRID_API_KEY) {
      return nodemailer.createTransporter({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
    }

    return nodemailer.createTransporter(emailConfig);
  }

  async sendEmail(to, subject, html, attachments = []) {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@windsurf.com',
        to,
        subject,
        html,
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to}: ${result.messageId}`);
      
      // Log email in database
      await this.logEmail(to, subject, 'sent');
      
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      await this.logEmail(to, subject, 'failed', error.message);
      return { success: false, error: error.message };
    }
  }

  async logEmail(to, subject, status, errorMessage = null) {
    try {
      await pool.execute(`
        INSERT INTO email_logs (recipient, subject, status, error_message, sent_at)
        VALUES (?, ?, ?, ?, NOW())
      `, [to, subject, status, errorMessage]);
    } catch (error) {
      console.error('Failed to log email:', error);
    }
  }

  async sendIssueAssignmentEmail(assigneeEmail, assigneeName, issue) {
    const subject = `New Issue Assigned: ${issue.title || issue.description.substring(0, 50)}...`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Issue Assignment</h2>
        <p>Hello ${assigneeName},</p>
        <p>A new issue has been assigned to you:</p>
        
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; color: #1e40af;">Issue Details</h3>
          <p><strong>ID:</strong> #${issue.id}</p>
          <p><strong>Title:</strong> ${issue.title || 'No title'}</p>
          <p><strong>Description:</strong> ${issue.description}</p>
          <p><strong>Priority:</strong> <span style="text-transform: uppercase; color: ${this.getPriorityColor(issue.priority)}">${issue.priority}</span></p>
          <p><strong>Status:</strong> ${issue.status}</p>
        </div>
        
        <p>Please log in to the system to view full details and take action.</p>
        <p style="margin-top: 24px;">Best regards,<br>Windsurf Team</p>
      </div>
    `;

    return await this.sendEmail(assigneeEmail, subject, html);
  }

  async sendIssueStatusUpdateEmail(employeeEmail, employeeName, issue, oldStatus, newStatus) {
    const subject = `Issue Status Update: #${issue.id}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Issue Status Update</h2>
        <p>Hello ${employeeName},</p>
        <p>Your issue status has been updated:</p>
        
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; color: #1e40af;">Issue #${issue.id}</h3>
          <p><strong>Title:</strong> ${issue.title || issue.description.substring(0, 50)}...</p>
          <p><strong>Status Change:</strong> 
            <span style="color: #dc2626;">${oldStatus}</span> → 
            <span style="color: #16a34a;">${newStatus}</span>
          </p>
        </div>
        
        <p>Log in to view more details about your issue.</p>
        <p style="margin-top: 24px;">Best regards,<br>Windsurf Team</p>
      </div>
    `;

    return await this.sendEmail(employeeEmail, subject, html);
  }

  async sendNewCommentEmail(userEmail, userName, issue, comment, commenterName) {
    const subject = `New Comment on Issue #${issue.id}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Comment Added</h2>
        <p>Hello ${userName},</p>
        <p>${commenterName} added a comment to your issue:</p>
        
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; color: #1e40af;">Issue #${issue.id}</h3>
          <p><strong>Title:</strong> ${issue.title || issue.description.substring(0, 50)}...</p>
        </div>
        
        <div style="background: #e0f2fe; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #0284c7;">
          <p style="margin: 0;"><strong>${commenterName} commented:</strong></p>
          <p style="margin: 8px 0 0 0;">${comment.content}</p>
        </div>
        
        <p>Log in to respond to this comment.</p>
        <p style="margin-top: 24px;">Best regards,<br>Windsurf Team</p>
      </div>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  async sendFeedbackReceivedEmail(adminEmail, feedback, employeeName) {
    const subject = `New Feedback Received from ${employeeName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Feedback Received</h2>
        <p>New feedback has been submitted:</p>
        
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; color: #1e40af;">Feedback Details</h3>
          <p><strong>From:</strong> ${employeeName}</p>
          <p><strong>Type:</strong> ${feedback.type}</p>
          <p><strong>Rating:</strong> ${feedback.rating}/5</p>
          <p><strong>Sentiment:</strong> ${feedback.sentiment}</p>
        </div>
        
        <div style="background: #e0f2fe; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Message:</strong></p>
          <p style="margin: 8px 0 0 0;">${feedback.message}</p>
        </div>
        
        <p>Log in to the admin dashboard to review and respond.</p>
        <p style="margin-top: 24px;">Best regards,<br>Windsurf System</p>
      </div>
    `;

    return await this.sendEmail(adminEmail, subject, html);
  }

  getPriorityColor(priority) {
    switch (priority) {
      case 'high': return '#dc2626';
      case 'urgent': return '#b91c1c';
      case 'medium': return '#ea580c';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service connection verified' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EnhancedEmailService();
