
const { getPool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class AuditService {
  static async logIssueAudit(issueId, action, changes, userId, request) {
    const pool = getPool();
    const auditId = uuidv4();
    
    try {
      await pool.execute(
        `INSERT INTO issue_audit_trail 
         (id, issue_id, user_id, action, old_value, new_value, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          auditId, 
          issueId, 
          userId, 
          action, 
          changes.old_value || null, 
          changes.new_value || null
        ]
      );
      
      return auditId;
    } catch (error) {
      console.error('Error logging audit trail:', error);
      throw error;
    }
  }

  static async logUserAudit(entityType, entityId, action, changes, performedBy) {
    const pool = getPool();
    const auditId = uuidv4();
    
    try {
      await pool.execute(
        `INSERT INTO dashboard_user_audit_logs 
         (id, entity_type, entity_id, action, changes, performed_by, performed_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [auditId, entityType, entityId, action, JSON.stringify(changes), performedBy]
      );
      
      return auditId;
    } catch (error) {
      console.error('Error logging user audit:', error);
      throw error;
    }
  }

  static async getAuditLogs(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT a.*, u.full_name as performed_by_name 
      FROM dashboard_user_audit_logs a
      LEFT JOIN dashboard_users u ON a.performed_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.entity_type) {
      query += ' AND a.entity_type = ?';
      params.push(filters.entity_type);
    }
    
    if (filters.entity_id) {
      query += ' AND a.entity_id = ?';
      params.push(filters.entity_id);
    }
    
    if (filters.action) {
      query += ' AND a.action = ?';
      params.push(filters.action);
    }
    
    query += ' ORDER BY a.performed_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getIssueAuditTrail(issueId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT a.*, u.full_name as user_name 
       FROM issue_audit_trail a
       LEFT JOIN dashboard_users u ON a.user_id = u.id
       WHERE a.issue_id = ? 
       ORDER BY a.created_at DESC`,
      [issueId]
    );
    
    return rows;
  }
}

module.exports = AuditService;
