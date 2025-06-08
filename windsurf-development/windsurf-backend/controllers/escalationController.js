
const { pool } = require('../config/database');
const escalationService = require('../services/escalationService');
const emailService = require('../services/actualEmailService');
const { validationResult } = require('express-validator');

class EscalationController {
  async getEscalations(req, res) {
    try {
      const { status, level, assignedTo, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE i.escalated_at IS NOT NULL';
      const params = [];

      if (status) {
        whereClause += ' AND i.status = ?';
        params.push(status);
      }

      if (level) {
        whereClause += ' AND i.escalation_level = ?';
        params.push(level);
      }

      if (assignedTo) {
        whereClause += ' AND i.assigned_to = ?';
        params.push(assignedTo);
      }

      const [escalations] = await pool.execute(`
        SELECT 
          i.*,
          e.name as employee_name,
          e.email as employee_email,
          e.city,
          e.cluster,
          du.name as assignee_name,
          TIMESTAMPDIFF(HOUR, i.escalated_at, NOW()) as hours_since_escalation
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        LEFT JOIN dashboard_users du ON i.assigned_to = du.id
        ${whereClause}
        ORDER BY i.escalated_at DESC
        LIMIT ? OFFSET ?
      `, [...params, limit, offset]);

      const [countResult] = await pool.execute(`
        SELECT COUNT(*) as total FROM issues i ${whereClause}
      `, params);

      res.json({
        success: true,
        data: escalations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      });
    } catch (error) {
      console.error('Get escalations error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch escalations'
      });
    }
  }

  async escalateIssue(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const { reason, escalateTo, priority } = req.body;
      const escalatedBy = req.user.id;

      const result = await escalationService.escalateIssue(id, {
        reason,
        escalateTo,
        priority,
        escalatedBy
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      res.json({
        success: true,
        data: result.issue,
        message: 'Issue escalated successfully'
      });
    } catch (error) {
      console.error('Escalate issue error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to escalate issue'
      });
    }
  }

  async deEscalateIssue(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const deEscalatedBy = req.user.id;

      await pool.execute(`
        UPDATE issues 
        SET escalated_at = NULL, 
            escalation_level = 0,
            escalation_count = GREATEST(escalation_count - 1, 0),
            updated_at = NOW()
        WHERE id = ?
      `, [id]);

      // Log audit trail
      await pool.execute(`
        INSERT INTO issue_audit_trail (id, issue_id, employee_uuid, action, details, created_at)
        VALUES (UUID(), ?, ?, 'de_escalated', ?, NOW())
      `, [id, deEscalatedBy, JSON.stringify({ reason })]);

      const [issue] = await pool.execute(`
        SELECT i.*, e.name as employee_name
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE i.id = ?
      `, [id]);

      res.json({
        success: true,
        data: issue[0],
        message: 'Issue de-escalated successfully'
      });
    } catch (error) {
      console.error('De-escalate issue error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to de-escalate issue'
      });
    }
  }

  async getEscalationRules(req, res) {
    try {
      const [rules] = await pool.execute(`
        SELECT * FROM escalation_rules 
        WHERE is_active = TRUE
        ORDER BY role, priority, escalation_level
      `);

      res.json({
        success: true,
        data: rules
      });
    } catch (error) {
      console.error('Get escalation rules error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch escalation rules'
      });
    }
  }

  async updateEscalationRule(req, res) {
    try {
      const { id } = req.params;
      const { time_threshold_minutes, notify_to, is_active } = req.body;

      await pool.execute(`
        UPDATE escalation_rules 
        SET time_threshold_minutes = ?, notify_to = ?, is_active = ?, updated_at = NOW()
        WHERE id = ?
      `, [time_threshold_minutes, notify_to, is_active, id]);

      const [rule] = await pool.execute(`
        SELECT * FROM escalation_rules WHERE id = ?
      `, [id]);

      res.json({
        success: true,
        data: rule[0],
        message: 'Escalation rule updated successfully'
      });
    } catch (error) {
      console.error('Update escalation rule error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update escalation rule'
      });
    }
  }

  async getEscalationMetrics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      let whereClause = 'WHERE i.escalated_at IS NOT NULL';
      const params = [];

      if (startDate) {
        whereClause += ' AND i.escalated_at >= ?';
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND i.escalated_at <= ?';
        params.push(endDate);
      }

      const [metrics] = await pool.execute(`
        SELECT 
          COUNT(*) as total_escalations,
          COUNT(CASE WHEN i.status IN ('resolved', 'closed') THEN 1 END) as resolved_escalations,
          AVG(i.escalation_level) as avg_escalation_level,
          AVG(TIMESTAMPDIFF(HOUR, i.escalated_at, COALESCE(i.closed_at, NOW()))) as avg_resolution_hours,
          COUNT(DISTINCT i.employee_uuid) as unique_escalating_users
        FROM issues i
        ${whereClause}
      `, params);

      res.json({
        success: true,
        data: metrics[0]
      });
    } catch (error) {
      console.error('Get escalation metrics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch escalation metrics'
      });
    }
  }
}

module.exports = new EscalationController();
