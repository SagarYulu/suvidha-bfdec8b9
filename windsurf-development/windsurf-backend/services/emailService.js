
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

  async sendIssueAssignmentEmail(assigneeEmail, assigneeName, issueId, issueTitle) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@windsurf.com',
      to: assigneeEmail,
      subject: `New Issue Assigned: ${issueTitle}`,
      html: `
        <h2>New Issue Assignment</h2>
        <p>Hello ${assigneeName},</p>
        <p>A new issue has been assigned to you:</p>
        <ul>
          <li><strong>Issue ID:</strong> #${issueId}</li>
          <li><strong>Title:</strong> ${issueTitle}</li>
        </ul>
        <p>Please log in to the system to view details and take action.</p>
        <p>Best regards,<br>Windsurf Team</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Assignment email sent to ${assigneeEmail}`);
    } catch (error) {
      console.error('Failed to send assignment email:', error);
    }
  }

  async sendIssueStatusUpdateEmail(employeeEmail, employeeName, issueId, newStatus) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@windsurf.com',
      to: employeeEmail,
      subject: `Issue Status Update: #${issueId}`,
      html: `
        <h2>Issue Status Update</h2>
        <p>Hello ${employeeName},</p>
        <p>Your issue status has been updated:</p>
        <ul>
          <li><strong>Issue ID:</strong> #${issueId}</li>
          <li><strong>New Status:</strong> ${newStatus}</li>
        </ul>
        <p>Log in to view more details about your issue.</p>
        <p>Best regards,<br>Windsurf Team</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Status update email sent to ${employeeEmail}`);
    } catch (error) {
      console.error('Failed to send status update email:', error);
    }
  }

  async sendWelcomeEmail(userEmail, userName, temporaryPassword) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@windsurf.com',
      to: userEmail,
      subject: 'Welcome to Windsurf - Account Created',
      html: `
        <h2>Welcome to Windsurf!</h2>
        <p>Hello ${userName},</p>
        <p>Your account has been created successfully.</p>
        <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
        <p>Please log in and change your password immediately.</p>
        <p>Best regards,<br>Windsurf Team</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${userEmail}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }
}

module.exports = new EmailService();
