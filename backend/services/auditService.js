
const { getPool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class AuditService {
  static async logAuditEvent(eventData) {
    const pool = getPool();
    const {
      entity_type,
      entity_id,
      action,
      changes,
      performed_by,
      ip_address,
      user_agent
    } = eventData;

    const auditId = uuidv4();

    await pool.execute(
      `INSERT INTO audit_logs 
       (id, entity_type, entity_id, action, changes, performed_by, ip_address, user_agent, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        auditId,
        entity_type,
        entity_id,
        action,
        JSON.stringify(changes),
        performed_by,
        ip_address,
        user_agent
      ]
    );

    return auditId;
  }

  static async logIssueAudit(issueId, action, changes, performedBy, req = null) {
    return this.logAuditEvent({
      entity_type: 'issue',
      entity_id: issueId,
      action,
      changes,
      performed_by: performedBy,
      ip_address: req?.ip || null,
      user_agent: req?.get('User-Agent') || null
    });
  }

  static async logUserAudit(userId, action, changes, performedBy, req = null) {
    return this.logAuditEvent({
      entity_type: 'user',
      entity_id: userId,
      action,
      changes,
      performed_by: performedBy,
      ip_address: req?.ip || null,
      user_agent: req?.get('User-Agent') || null
    });
  }

  static async logDashboardUserAudit(dashboardUserId, action, changes, performedBy, req = null) {
    return this.logAuditEvent({
      entity_type: 'dashboard_user',
      entity_id: dashboardUserId,
      action,
      changes,
      performed_by: performedBy,
      ip_address: req?.ip || null,
      user_agent: req?.get('User-Agent') || null
    });
  }

  static async logPermissionAudit(roleId, action, changes, performedBy, req = null) {
    return this.logAuditEvent({
      entity_type: 'permission',
      entity_id: roleId,
      action,
      changes,
      performed_by: performedBy,
      ip_address: req?.ip || null,
      user_agent: req?.get('User-Agent') || null
    });
  }

  static async getAuditLogs(filters = {}) {
    const pool = getPool();
    const { 
      entity_type, 
      entity_id, 
      action, 
      performed_by, 
      startDate, 
      endDate,
      page = 1,
      limit = 50
    } = filters;

    let query = `
      SELECT 
        a.*,
        u.full_name as performed_by_name
      FROM audit_logs a
      LEFT JOIN dashboard_users u ON a.performed_by = u.id
      WHERE 1=1
    `;

    const params = [];

    if (entity_type) {
      query += ' AND a.entity_type = ?';
      params.push(entity_type);
    }

    if (entity_id) {
      query += ' AND a.entity_id = ?';
      params.push(entity_id);
    }

    if (action) {
      query += ' AND a.action = ?';
      params.push(action);
    }

    if (performed_by) {
      query += ' AND a.performed_by = ?';
      params.push(performed_by);
    }

    if (startDate) {
      query += ' AND a.performed_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND a.performed_at <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY a.performed_at DESC';

    if (limit) {
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getAuditStats(filters = {}) {
    const pool = getPool();
    const { startDate, endDate, entity_type } = filters;

    let query = `
      SELECT 
        entity_type,
        action,
        COUNT(*) as count,
        DATE(performed_at) as date
      FROM audit_logs
      WHERE 1=1
    `;

    const params = [];

    if (startDate) {
      query += ' AND performed_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND performed_at <= ?';
      params.push(endDate);
    }

    if (entity_type) {
      query += ' AND entity_type = ?';
      params.push(entity_type);
    }

    query += ' GROUP BY entity_type, action, DATE(performed_at) ORDER BY date DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async cleanupOldAuditLogs(daysToKeep = 365) {
    const pool = getPool();
    
    const [result] = await pool.execute(
      'DELETE FROM audit_logs WHERE performed_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [daysToKeep]
    );

    console.log(`Cleaned up ${result.affectedRows} old audit logs`);
    return result.affectedRows;
  }
}

module.exports = AuditService;
