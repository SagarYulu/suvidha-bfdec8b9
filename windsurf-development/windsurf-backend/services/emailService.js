
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
  
  async sendEmail(to, subject, html, attachments = []) {
    try {
      if (!process.env.SMTP_USER) {
        console.log('Email would be sent:', { to, subject });
        return { success: true, messageId: 'mock-' + Date.now() };
      }
      
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
        attachments
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
      
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }
  
  async sendIssueCreatedEmail(issueData, recipientEmail) {
    const subject = `New Issue Created - ${issueData.type_id}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Issue Created</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
          <p><strong>Issue ID:</strong> ${issueData.id}</p>
          <p><strong>Type:</strong> ${issueData.type_id}</p>
          <p><strong>Sub Type:</strong> ${issueData.sub_type_id}</p>
          <p><strong>Priority:</strong> ${issueData.priority}</p>
          <p><strong>Employee:</strong> ${issueData.employee_name}</p>
          <p><strong>Description:</strong> ${issueData.description}</p>
          <p><strong>Created:</strong> ${new Date(issueData.created_at).toLocaleString()}</p>
        </div>
      </div>
    `;
    
    return await this.sendEmail(recipientEmail, subject, html);
  }
  
  async sendStatusUpdateEmail(issueData, recipientEmail, previousStatus, newStatus) {
    const subject = `Issue Status Update - ${issueData.type_id}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Issue Status Updated</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
          <p><strong>Issue ID:</strong> ${issueData.id}</p>
          <p><strong>Type:</strong> ${issueData.type_id}</p>
          <p><strong>Previous Status:</strong> <span style="color: #666;">${previousStatus}</span></p>
          <p><strong>New Status:</strong> <span style="color: #007cba; font-weight: bold;">${newStatus}</span></p>
          <p><strong>Description:</strong> ${issueData.description}</p>
        </div>
      </div>
    `;
    
    return await this.sendEmail(recipientEmail, subject, html);
  }
}

module.exports = new EmailService();
