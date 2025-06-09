
const EscalationService = require('../services/escalationService');
const IssueModel = require('../models/Issue');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class EscalationController {
  async createEscalation(req, res) {
    try {
      const { issue_id, escalated_to, reason, escalation_type } = req.body;
      const created_by = req.user.id;

      // Verify issue exists
      const issue = await IssueModel.findById(issue_id);
      if (!issue) {
        return errorResponse(res, 'Issue not found', 404);
      }

      const escalationData = {
        issue_id,
        escalated_from: issue.assigned_to,
        escalated_to,
        reason,
        escalation_type: escalation_type || 'manual',
        created_by
      };

      const escalation = await EscalationService.createEscalation(escalationData);

      successResponse(res, escalation, 'Escalation created successfully', 201);
    } catch (error) {
      console.error('Create escalation error:', error);
      errorResponse(res, error.message);
    }
  }

  async getEscalation(req, res) {
    try {
      const { id } = req.params;
      const EscalationModel = require('../models/Escalation');
      const escalation = await EscalationModel.findById(id);

      if (!escalation) {
        return errorResponse(res, 'Escalation not found', 404);
      }

      successResponse(res, escalation, 'Escalation retrieved successfully');
    } catch (error) {
      console.error('Get escalation error:', error);
      errorResponse(res, error.message);
    }
  }

  async getIssueEscalations(req, res) {
    try {
      const { issue_id } = req.params;
      
      // Verify issue exists
      const issue = await IssueModel.findById(issue_id);
      if (!issue) {
        return errorResponse(res, 'Issue not found', 404);
      }

      const escalations = await EscalationService.getEscalationsByIssue(issue_id);

      successResponse(res, escalations, 'Issue escalations retrieved successfully');
    } catch (error) {
      console.error('Get issue escalations error:', error);
      errorResponse(res, error.message);
    }
  }

  async getPendingEscalations(req, res) {
    try {
      const escalations = await EscalationService.getPendingEscalations();

      successResponse(res, escalations, 'Pending escalations retrieved successfully');
    } catch (error) {
      console.error('Get pending escalations error:', error);
      errorResponse(res, error.message);
    }
  }

  async resolveEscalation(req, res) {
    try {
      const { id } = req.params;
      const { resolution } = req.body;
      const resolved_by = req.user.id;

      const escalation = await EscalationService.resolveEscalation(id, resolved_by, resolution);

      if (!escalation) {
        return errorResponse(res, 'Escalation not found', 404);
      }

      successResponse(res, escalation, 'Escalation resolved successfully');
    } catch (error) {
      console.error('Resolve escalation error:', error);
      errorResponse(res, error.message);
    }
  }

  async getEscalationStats(req, res) {
    try {
      const filters = {
        startDate: req.query.start_date,
        endDate: req.query.end_date,
        escalation_type: req.query.escalation_type,
        escalated_to: req.query.escalated_to
      };

      const stats = await EscalationService.getEscalationStats(filters);

      // Add additional metrics
      const resolution_rate = stats.total_escalations > 0 
        ? (stats.resolved_escalations / stats.total_escalations) * 100 
        : 0;

      const result = {
        ...stats,
        resolution_rate,
        pending_rate: stats.total_escalations > 0 
          ? (stats.pending_escalations / stats.total_escalations) * 100 
          : 0
      };

      successResponse(res, result, 'Escalation statistics retrieved successfully');
    } catch (error) {
      console.error('Get escalation stats error:', error);
      errorResponse(res, error.message);
    }
  }

  async autoEscalateIssue(req, res) {
    try {
      const { issue_id } = req.params;
      const { escalation_type, reason } = req.body;

      const escalation = await EscalationService.autoEscalate(
        issue_id, 
        escalation_type || 'manual', 
        reason || 'Manual escalation requested'
      );

      if (!escalation) {
        return errorResponse(res, 'Unable to escalate issue. No suitable escalation target found.', 400);
      }

      successResponse(res, escalation, 'Issue escalated successfully');
    } catch (error) {
      console.error('Auto escalate issue error:', error);
      errorResponse(res, error.message);
    }
  }

  async getMyEscalations(req, res) {
    try {
      const user_id = req.user.id;
      const type = req.query.type; // 'created' or 'assigned'

      const EscalationModel = require('../models/Escalation');
      let escalations;

      if (type === 'created') {
        escalations = await EscalationModel.findByCreatedBy(user_id);
      } else if (type === 'assigned') {
        escalations = await EscalationModel.findByEscalatedTo(user_id);
      } else {
        // Get both created and assigned escalations
        const [created, assigned] = await Promise.all([
          EscalationModel.findByCreatedBy(user_id),
          EscalationModel.findByEscalatedTo(user_id)
        ]);

        escalations = {
          created,
          assigned,
          total: created.length + assigned.length
        };
      }

      successResponse(res, escalations, 'User escalations retrieved successfully');
    } catch (error) {
      console.error('Get my escalations error:', error);
      errorResponse(res, error.message);
    }
  }

  async processAutoEscalations(req, res) {
    try {
      // This endpoint can be used to manually trigger auto-escalation check
      // Useful for testing or manual intervention
      const escalations = await EscalationService.checkAndProcessAutoEscalations();

      successResponse(res, {
        escalations_created: escalations.length,
        escalations
      }, 'Auto-escalation process completed');
    } catch (error) {
      console.error('Process auto escalations error:', error);
      errorResponse(res, error.message);
    }
  }
}

module.exports = new EscalationController();
