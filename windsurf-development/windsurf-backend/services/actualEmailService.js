
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Email configuration error:', error);
        } else {
          console.log('Email service ready');
        }
      });
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  async sendEmail(to, subject, html, options = {}) {
    if (!this.transporter) {
      throw new Error('Email service not configured');
    }

    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@grievance-portal.com',
        to,
        subject,
        html,
        ...options
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', { to, subject, messageId: result.messageId });
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendIssueAssignmentEmail(assigneeEmail, assigneeName, issue) {
    const subject = `New Issue Assigned: ${issue.description.substring(0, 50)}...`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Issue Assigned to You</h2>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #444;">Issue Details</h3>
          <p><strong>ID:</strong> ${issue.id}</p>
          <p><strong>Type:</strong> ${issue.type_id}</p>
          <p><strong>Priority:</strong> ${issue.priority}</p>
          <p><strong>Status:</strong> ${issue.status}</p>
          <p><strong>Description:</strong></p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 10px 0;">
            ${issue.description}
          </div>
        </div>

        <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Assigned by:</strong> System</p>
          <p style="margin: 5px 0 0 0;"><strong>Assigned at:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message from the Grievance Portal. Please do not reply to this email.
        </p>
      </div>
    `;

    return this.sendEmail(assigneeEmail, subject, html);
  }

  async sendIssueStatusUpdateEmail(recipientEmail, recipientName, issue, oldStatus, newStatus) {
    const subject = `Issue Status Updated: ${issue.description.substring(0, 50)}...`;
    
    const statusColors = {
      'open': '#17a2b8',
      'in_progress': '#ffc107',
      'resolved': '#28a745',
      'closed': '#6c757d'
    };

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Issue Status Updated</h2>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #444;">Issue Details</h3>
          <p><strong>ID:</strong> ${issue.id}</p>
          <p><strong>Type:</strong> ${issue.type_id}</p>
          <p><strong>Priority:</strong> ${issue.priority}</p>
        </div>

        <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 15px 0; color: #155724;">Status Change</h4>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="background: ${statusColors[oldStatus] || '#6c757d'}; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; text-transform: uppercase;">
              ${oldStatus}
            </span>
            <span style="margin: 0 10px; color: #155724;">→</span>
            <span style="background: ${statusColors[newStatus] || '#6c757d'}; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; text-transform: uppercase;">
              ${newStatus}
            </span>
          </div>
          <p style="margin: 10px 0 0 0; color: #155724; font-size: 12px;">
            Updated on ${new Date().toLocaleString()}
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message from the Grievance Portal. Please do not reply to this email.
        </p>
      </div>
    `;

    return this.sendEmail(recipientEmail, subject, html);
  }

  async sendNewCommentEmail(recipientEmail, recipientName, issue, comment, commenterName) {
    const subject = `New Comment on Issue: ${issue.description.substring(0, 50)}...`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Comment Added</h2>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #444;">Issue Details</h3>
          <p><strong>ID:</strong> ${issue.id}</p>
          <p><strong>Type:</strong> ${issue.type_id}</p>
          <p><strong>Status:</strong> ${issue.status}</p>
        </div>

        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #856404;">New Comment by ${commenterName}</h4>
          <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #ffc107;">
            ${comment.content}
          </div>
          <p style="margin: 10px 0 0 0; color: #856404; font-size: 12px;">
            Posted on ${new Date().toLocaleString()}
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message from the Grievance Portal. Please do not reply to this email.
        </p>
      </div>
    `;

    return this.sendEmail(recipientEmail, subject, html);
  }
}

module.exports = new EmailService();
