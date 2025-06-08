
const { pool } = require('../config/database');

class AuditController {
  async getAuditTrail(req, res) {
    try {
      const { issueId, userId, action, startDate, endDate, page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE 1=1';
      const params = [];

      if (issueId) {
        whereClause += ' AND iat.issue_id = ?';
        params.push(issueId);
      }

      if (userId) {
        whereClause += ' AND iat.employee_uuid = ?';
        params.push(userId);
      }

      if (action) {
        whereClause += ' AND iat.action = ?';
        params.push(action);
      }

      if (startDate) {
        whereClause += ' AND iat.created_at >= ?';
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND iat.created_at <= ?';
        params.push(endDate);
      }

      const [auditLogs] = await pool.execute(`
        SELECT 
          iat.*,
          COALESCE(e.name, du.name, 'System') as performer_name,
          i.description as issue_description
        FROM issue_audit_trail iat
        LEFT JOIN employees e ON iat.employee_uuid = e.id
        LEFT JOIN dashboard_users du ON iat.employee_uuid = du.id
        LEFT JOIN issues i ON iat.issue_id = i.id
        ${whereClause}
        ORDER BY iat.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, limit, offset]);

      const [countResult] = await pool.execute(`
        SELECT COUNT(*) as total FROM issue_audit_trail iat ${whereClause}
      `, params);

      res.json({
        success: true,
        data: auditLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      });
    } catch (error) {
      console.error('Get audit trail error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audit trail'
      });
    }
  }

  async logAction(action, issueId, employeeUuid, details = null, previousStatus = null, newStatus = null) {
    try {
      const id = require('uuid').v4();
      
      await pool.execute(`
        INSERT INTO issue_audit_trail (
          id, issue_id, employee_uuid, action, details, 
          previous_status, new_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        id, issueId, employeeUuid, action, 
        details ? JSON.stringify(details) : null,
        previousStatus, newStatus
      ]);

      return id;
    } catch (error) {
      console.error('Log audit action error:', error);
      throw error;
    }
  }

  async getActionSummary(req, res) {
    try {
      const { startDate, endDate, userId } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (startDate) {
        whereClause += ' AND created_at >= ?';
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND created_at <= ?';
        params.push(endDate);
      }

      if (userId) {
        whereClause += ' AND employee_uuid = ?';
        params.push(userId);
      }

      const [summary] = await pool.execute(`
        SELECT 
          action,
          COUNT(*) as count,
          COUNT(DISTINCT issue_id) as unique_issues,
          COUNT(DISTINCT employee_uuid) as unique_users
        FROM issue_audit_trail
        ${whereClause}
        GROUP BY action
        ORDER BY count DESC
      `, params);

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Get action summary error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch action summary'
      });
    }
  }

  async getUserActivity(req, res) {
    try {
      const { userId } = req.params;
      const { startDate, endDate, limit = 20 } = req.query;
      
      let whereClause = 'WHERE iat.employee_uuid = ?';
      const params = [userId];

      if (startDate) {
        whereClause += ' AND iat.created_at >= ?';
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND iat.created_at <= ?';
        params.push(endDate);
      }

      const [activity] = await pool.execute(`
        SELECT 
          iat.action,
          iat.created_at,
          iat.details,
          i.description as issue_description,
          i.id as issue_id
        FROM issue_audit_trail iat
        LEFT JOIN issues i ON iat.issue_id = i.id
        ${whereClause}
        ORDER BY iat.created_at DESC
        LIMIT ?
      `, [...params, parseInt(limit)]);

      res.json({
        success: true,
        data: activity
      });
    } catch (error) {
      console.error('Get user activity error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user activity'
      });
    }
  }

  async getSystemMetrics(req, res) {
    try {
      const { period = '7d' } = req.query;
      
      let dateFilter;
      switch (period) {
        case '24h':
          dateFilter = 'created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)';
          break;
        case '7d':
          dateFilter = 'created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
          break;
        case '30d':
          dateFilter = 'created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
          break;
        default:
          dateFilter = 'created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
      }

      const [metrics] = await pool.execute(`
        SELECT 
          COUNT(*) as total_actions,
          COUNT(DISTINCT issue_id) as issues_affected,
          COUNT(DISTINCT employee_uuid) as active_users,
          COUNT(CASE WHEN action = 'created' THEN 1 END) as issues_created,
          COUNT(CASE WHEN action = 'status_changed' AND new_status IN ('resolved', 'closed') THEN 1 END) as issues_resolved,
          COUNT(CASE WHEN action = 'escalated' THEN 1 END) as issues_escalated,
          COUNT(CASE WHEN action = 'assigned' THEN 1 END) as assignments_made
        FROM issue_audit_trail
        WHERE ${dateFilter}
      `);

      res.json({
        success: true,
        data: {
          ...metrics[0],
          period: period
        }
      });
    } catch (error) {
      console.error('Get system metrics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch system metrics'
      });
    }
  }
}

module.exports = new AuditController();
