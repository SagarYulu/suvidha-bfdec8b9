
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendStatusChangeEmail(issue, employee, previousStatus) {
    try {
      const subject = `Issue #${issue.id.slice(0, 8)} Status Updated to ${issue.status}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Issue Status Update</h2>
          <p>Dear ${employee.name},</p>
          <p>Your issue status has been updated:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Issue ID:</strong> #${issue.id.slice(0, 8)}</p>
            <p><strong>Previous Status:</strong> ${previousStatus}</p>
            <p><strong>New Status:</strong> ${issue.status}</p>
            <p><strong>Description:</strong> ${issue.description}</p>
          </div>
          <p>Thank you for your patience.</p>
          <p>Best regards,<br>Support Team</p>
        </div>
      `;
      
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@company.com',
        to: employee.email,
        subject,
        html
      });
      
      console.log(`Status change email sent to ${employee.email}`);
    } catch (error) {
      console.error('Error sending status change email:', error);
    }
  }

  async sendAssignmentEmail(issue, assignee, employee) {
    try {
      const subject = `New Issue Assigned: #${issue.id.slice(0, 8)}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Issue Assignment</h2>
          <p>Dear ${assignee.name},</p>
          <p>A new issue has been assigned to you:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Issue ID:</strong> #${issue.id.slice(0, 8)}</p>
            <p><strong>Employee:</strong> ${employee.name}</p>
            <p><strong>Priority:</strong> ${issue.priority}</p>
            <p><strong>Description:</strong> ${issue.description}</p>
          </div>
          <p>Please review and take appropriate action.</p>
          <p>Best regards,<br>System Administrator</p>
        </div>
      `;
      
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@company.com',
        to: assignee.email,
        subject,
        html
      });
      
      console.log(`Assignment email sent to ${assignee.email}`);
    } catch (error) {
      console.error('Error sending assignment email:', error);
    }
  }

  async sendCommentNotification(issue, commenter, employee, comment) {
    try {
      const subject = `New Comment on Issue #${issue.id.slice(0, 8)}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Comment Added</h2>
          <p>Dear ${employee.name},</p>
          <p>A new comment has been added to your issue:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Issue ID:</strong> #${issue.id.slice(0, 8)}</p>
            <p><strong>Comment by:</strong> ${commenter.name}</p>
            <p><strong>Comment:</strong> ${comment.content}</p>
          </div>
          <p>You can view the full issue details in your portal.</p>
          <p>Best regards,<br>Support Team</p>
        </div>
      `;
      
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@company.com',
        to: employee.email,
        subject,
        html
      });
      
      console.log(`Comment notification sent to ${employee.email}`);
    } catch (error) {
      console.error('Error sending comment notification:', error);
    }
  }
}

module.exports = new EmailService();
