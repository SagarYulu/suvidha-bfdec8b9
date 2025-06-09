
const EscalationModel = require('../models/Escalation');
const IssueModel = require('../models/Issue');
const UserModel = require('../models/User');
const EmailService = require('./emailService');
const NotificationService = require('./notificationService');
const AuditTrailModel = require('../models/AuditTrail');
const { v4: uuidv4 } = require('uuid');

class EscalationService {
  static async createEscalation(escalationData) {
    try {
      const escalationId = uuidv4();
      
      const escalation = await EscalationModel.create({
        id: escalationId,
        issue_id: escalationData.issue_id,
        escalated_from: escalationData.escalated_from,
        escalated_to: escalationData.escalated_to,
        escalation_type: escalationData.escalation_type || 'manual',
        reason: escalationData.reason,
        escalated_at: new Date().toISOString(),
        status: 'pending',
        created_by: escalationData.created_by
      });

      // Update issue with escalation info
      await IssueModel.update(escalationData.issue_id, {
        escalated_at: new Date().toISOString(),
        escalated_to: escalationData.escalated_to
      });

      // Create audit trail
      await AuditTrailModel.create({
        id: uuidv4(),
        issue_id: escalationData.issue_id,
        user_id: escalationData.created_by,
        action: 'escalation_created',
        old_value: { escalated: false },
        new_value: { 
          escalated: true, 
          escalated_to: escalationData.escalated_to,
          escalation_type: escalationData.escalation_type 
        },
        metadata: { escalation_id: escalationId, reason: escalationData.reason }
      });

      // Send notifications
      const issue = await IssueModel.findById(escalationData.issue_id);
      await EmailService.sendEscalationEmail(escalation, issue);
      
      await NotificationService.createNotification({
        user_id: escalationData.escalated_to,
        issue_id: escalationData.issue_id,
        type: 'escalation',
        title: 'Issue Escalated to You',
        message: `Issue ${escalationData.issue_id} has been escalated to you. Reason: ${escalationData.reason}`
      });

      return escalation;
    } catch (error) {
      console.error('Error creating escalation:', error);
      throw error;
    }
  }

  static async autoEscalate(issueId, escalationType, reason) {
    try {
      const issue = await IssueModel.findById(issueId);
      if (!issue) {
        throw new Error('Issue not found');
      }

      // Determine escalation target based on current assignment and type
      const escalationTarget = await this.getEscalationTarget(issue, escalationType);
      
      if (!escalationTarget) {
        console.log(`No escalation target found for issue ${issueId}`);
        return null;
      }

      const escalationData = {
        issue_id: issueId,
        escalated_from: issue.assigned_to,
        escalated_to: escalationTarget.id,
        escalation_type: escalationType,
        reason: reason,
        created_by: 'system' // System-initiated escalation
      };

      return await this.createEscalation(escalationData);
    } catch (error) {
      console.error('Error in auto escalation:', error);
      throw error;
    }
  }

  static async getEscalationTarget(issue, escalationType) {
    try {
      // Get current assignee info
      let currentAssignee = null;
      if (issue.assigned_to) {
        currentAssignee = await UserModel.findById(issue.assigned_to);
      }

      // Escalation hierarchy: agent -> manager -> admin
      if (!currentAssignee || currentAssignee.role === 'agent') {
        // Escalate to manager
        const managers = await UserModel.findByRole('manager');
        return managers.length > 0 ? managers[0] : null;
      } else if (currentAssignee.role === 'manager') {
        // Escalate to admin
        const admins = await UserModel.findByRole('admin');
        return admins.length > 0 ? admins[0] : null;
      }

      // Already at highest level
      return null;
    } catch (error) {
      console.error('Error getting escalation target:', error);
      return null;
    }
  }

  static async resolveEscalation(escalationId, resolvedBy, resolution) {
    try {
      const escalation = await EscalationModel.resolveEscalation(escalationId, resolvedBy);
      
      if (escalation) {
        // Create audit trail
        await AuditTrailModel.create({
          id: uuidv4(),
          issue_id: escalation.issue_id,
          user_id: resolvedBy,
          action: 'escalation_resolved',
          old_value: { escalation_status: 'pending' },
          new_value: { escalation_status: 'resolved' },
          metadata: { escalation_id: escalationId, resolution: resolution }
        });

        // Notify relevant parties
        await NotificationService.createNotification({
          user_id: escalation.created_by,
          issue_id: escalation.issue_id,
          type: 'escalation_resolved',
          title: 'Escalation Resolved',
          message: `Escalation for issue ${escalation.issue_id} has been resolved.`
        });
      }

      return escalation;
    } catch (error) {
      console.error('Error resolving escalation:', error);
      throw error;
    }
  }

  static async getEscalationsByIssue(issueId) {
    try {
      return await EscalationModel.findByIssueId(issueId);
    } catch (error) {
      console.error('Error getting escalations by issue:', error);
      return [];
    }
  }

  static async getPendingEscalations() {
    try {
      return await EscalationModel.getPendingEscalations();
    } catch (error) {
      console.error('Error getting pending escalations:', error);
      return [];
    }
  }

  static async getEscalationStats(filters = {}) {
    try {
      return await EscalationModel.getEscalationStats(filters);
    } catch (error) {
      console.error('Error getting escalation stats:', error);
      return {
        total_escalations: 0,
        pending_escalations: 0,
        resolved_escalations: 0,
        avg_resolution_hours: 0
      };
    }
  }

  static async checkAndProcessAutoEscalations() {
    try {
      console.log('Checking for auto-escalations...');
      
      // Get all open/in-progress issues
      const openIssues = await IssueModel.getAll({ 
        status: ['open', 'in_progress'] 
      });

      const escalationsCreated = [];

      for (const issue of openIssues) {
        const createdAt = new Date(issue.created_at);
        const now = new Date();
        const hoursElapsed = (now - createdAt) / (1000 * 60 * 60);
        const daysElapsed = hoursElapsed / 24;

        // Check if issue needs escalation
        let shouldEscalate = false;
        let escalationType = '';
        let reason = '';

        if (daysElapsed > 14 && !issue.escalated_at) {
          shouldEscalate = true;
          escalationType = 'auto_critical';
          reason = `Automatic escalation: Issue has been open for ${Math.floor(daysElapsed)} days without resolution`;
        } else if (daysElapsed > 30) {
          shouldEscalate = true;
          escalationType = 'auto_breach';
          reason = `SLA breach escalation: Issue has exceeded 30-day resolution target`;
        }

        if (shouldEscalate) {
          try {
            const escalation = await this.autoEscalate(issue.id, escalationType, reason);
            if (escalation) {
              escalationsCreated.push(escalation);
              console.log(`Auto-escalated issue ${issue.id} after ${Math.floor(daysElapsed)} days`);
            }
          } catch (error) {
            console.error(`Failed to auto-escalate issue ${issue.id}:`, error);
          }
        }
      }

      console.log(`Auto-escalation check complete. ${escalationsCreated.length} escalations created.`);
      return escalationsCreated;
    } catch (error) {
      console.error('Error in auto-escalation check:', error);
      return [];
    }
  }
}

module.exports = EscalationService;
