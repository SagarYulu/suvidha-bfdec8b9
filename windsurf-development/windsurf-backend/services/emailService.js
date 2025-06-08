
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'localhost',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendStatusEmail(employeeEmail, employeeName, issue, oldStatus, newStatus) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@windsurf.com',
      to: employeeEmail,
      subject: `Issue Status Update: #${issue.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E40AF;">Issue Status Update</h2>
          <p>Hello ${employeeName},</p>
          <p>Your issue status has been updated:</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Issue ID:</strong> #${issue.id}</p>
            <p><strong>Description:</strong> ${issue.description}</p>
            <p><strong>Previous Status:</strong> <span style="color: #EF4444;">${oldStatus}</span></p>
            <p><strong>New Status:</strong> <span style="color: #10B981;">${newStatus}</span></p>
          </div>
          <p>Log in to the portal to view more details about your issue.</p>
          <p>Best regards,<br>Windsurf Support Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Status update email sent to ${employeeEmail}`);
    } catch (error) {
      console.error('Failed to send status update email:', error);
      throw error;
    }
  }

  async sendCommentEmail(employeeEmail, employeeName, issue, comment, commenterName) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@windsurf.com',
      to: employeeEmail,
      subject: `New Comment on Issue #${issue.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E40AF;">New Comment Added</h2>
          <p>Hello ${employeeName},</p>
          <p>A new comment has been added to your issue:</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Issue ID:</strong> #${issue.id}</p>
            <p><strong>Comment by:</strong> ${commenterName}</p>
            <p><strong>Comment:</strong></p>
            <div style="background: white; padding: 15px; border-left: 4px solid #1E40AF; margin-top: 10px;">
              ${comment.content}
            </div>
          </div>
          <p>Log in to the portal to reply or view more details.</p>
          <p>Best regards,<br>Windsurf Support Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Comment notification email sent to ${employeeEmail}`);
    } catch (error) {
      console.error('Failed to send comment email:', error);
      throw error;
    }
  }

  async sendAssignmentEmail(assigneeEmail, assigneeName, issue, assignedByName) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@windsurf.com',
      to: assigneeEmail,
      subject: `Issue Assigned: #${issue.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E40AF;">New Issue Assignment</h2>
          <p>Hello ${assigneeName},</p>
          <p>A new issue has been assigned to you:</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Issue ID:</strong> #${issue.id}</p>
            <p><strong>Description:</strong> ${issue.description}</p>
            <p><strong>Priority:</strong> <span style="color: #EF4444;">${issue.priority}</span></p>
            <p><strong>Assigned by:</strong> ${assignedByName}</p>
            <p><strong>Created:</strong> ${new Date(issue.created_at).toLocaleDateString()}</p>
          </div>
          <p>Please log in to the admin portal to review and take action on this issue.</p>
          <p>Best regards,<br>Windsurf Support Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Assignment email sent to ${assigneeEmail}`);
    } catch (error) {
      console.error('Failed to send assignment email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(userEmail, userName, temporaryPassword) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@windsurf.com',
      to: userEmail,
      subject: 'Welcome to Windsurf - Account Created',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E40AF;">Welcome to Windsurf!</h2>
          <p>Hello ${userName},</p>
          <p>Your account has been created successfully.</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Temporary Password:</strong> <span style="color: #EF4444;">${temporaryPassword}</span></p>
          </div>
          <p><strong>Important:</strong> Please log in and change your password immediately for security.</p>
          <p>Best regards,<br>Windsurf Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${userEmail}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
