
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (!process.env.SMTP_HOST) {
      console.warn('SMTP configuration not found. Email service disabled.');
      return;
    }

    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    console.log('Email service initialized');
  }

  async sendIssueCreatedNotification(issue, employee) {
    if (!this.transporter) return false;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: employee.email,
      subject: `Issue Created - #${issue.id}`,
      html: `
        <h2>Your grievance has been submitted</h2>
        <p>Dear ${employee.name},</p>
        <p>Your grievance has been successfully submitted with the following details:</p>
        <ul>
          <li><strong>Issue ID:</strong> ${issue.id}</li>
          <li><strong>Priority:</strong> ${issue.priority}</li>
          <li><strong>Status:</strong> ${issue.status}</li>
          <li><strong>Description:</strong> ${issue.description}</li>
        </ul>
        <p>We will review your grievance and get back to you soon.</p>
        <p>Thank you for your patience.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Issue creation email sent to ${employee.email}`);
      return true;
    } catch (error) {
      console.error('Failed to send issue creation email:', error);
      return false;
    }
  }

  async sendIssueStatusUpdateNotification(issue, employee, oldStatus, newStatus) {
    if (!this.transporter) return false;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: employee.email,
      subject: `Issue Update - #${issue.id}`,
      html: `
        <h2>Your grievance status has been updated</h2>
        <p>Dear ${employee.name},</p>
        <p>Your grievance status has been updated:</p>
        <ul>
          <li><strong>Issue ID:</strong> ${issue.id}</li>
          <li><strong>Previous Status:</strong> ${oldStatus}</li>
          <li><strong>New Status:</strong> ${newStatus}</li>
        </ul>
        ${newStatus === 'closed' ? '<p><strong>Your grievance has been resolved. Please provide feedback on the resolution.</strong></p>' : ''}
        <p>Thank you for your patience.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Status update email sent to ${employee.email}`);
      return true;
    } catch (error) {
      console.error('Failed to send status update email:', error);
      return false;
    }
  }

  async sendAssignmentNotification(issue, agent, employee) {
    if (!this.transporter) return false;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: agent.email,
      subject: `Issue Assigned - #${issue.id}`,
      html: `
        <h2>New issue assigned to you</h2>
        <p>Dear ${agent.name},</p>
        <p>A new grievance has been assigned to you:</p>
        <ul>
          <li><strong>Issue ID:</strong> ${issue.id}</li>
          <li><strong>Priority:</strong> ${issue.priority}</li>
          <li><strong>Employee:</strong> ${employee.name} (${employee.email})</li>
          <li><strong>Description:</strong> ${issue.description}</li>
        </ul>
        <p>Please review and take appropriate action.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Assignment email sent to ${agent.email}`);
      return true;
    } catch (error) {
      console.error('Failed to send assignment email:', error);
      return false;
    }
  }

  async sendEscalationNotification(issue, manager, employee) {
    if (!this.transporter) return false;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: manager.email,
      subject: `Escalated Issue - #${issue.id}`,
      html: `
        <h2>Issue escalated for review</h2>
        <p>Dear ${manager.name},</p>
        <p>An issue has been escalated and requires your attention:</p>
        <ul>
          <li><strong>Issue ID:</strong> ${issue.id}</li>
          <li><strong>Priority:</strong> ${issue.priority}</li>
          <li><strong>Employee:</strong> ${employee.name} (${employee.email})</li>
          <li><strong>Days Open:</strong> ${Math.floor((Date.now() - new Date(issue.created_at)) / (1000 * 60 * 60 * 24))}</li>
          <li><strong>Description:</strong> ${issue.description}</li>
        </ul>
        <p>This issue has exceeded the standard resolution time and needs immediate attention.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Escalation email sent to ${manager.email}`);
      return true;
    } catch (error) {
      console.error('Failed to send escalation email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
