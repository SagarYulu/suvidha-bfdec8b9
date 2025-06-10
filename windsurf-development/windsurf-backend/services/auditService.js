
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class AuditService {
  // Log action for audit trail
  async logAction(entityType, entityId, action, changes, createdBy) {
    try {
      await db.execute(
        `INSERT INTO master_audit_logs (id, entity_type, entity_id, action, changes, created_by) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), entityType, entityId, action, JSON.stringify(changes), createdBy]
      );
    } catch (error) {
      console.error('Error logging audit trail:', error);
    }
  }

  // Get audit logs with optional filtering
  async getAuditLogs(entityType = null) {
    let query = `
      SELECT al.*, du.name as user_name 
      FROM master_audit_logs al 
      LEFT JOIN dashboard_users du ON al.created_by = du.id
    `;
    const params = [];
    
    if (entityType) {
      query += ' WHERE al.entity_type = ?';
      params.push(entityType);
    }
    
    query += ' ORDER BY al.created_at DESC LIMIT 100';
    
    const [rows] = await db.execute(query, params);
    
    return rows.map(row => ({
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      action: row.action,
      changes: typeof row.changes === 'string' ? JSON.parse(row.changes) : row.changes,
      createdBy: row.created_by,
      userName: row.user_name,
      createdAt: row.created_at
    }));
  }

  // Log user actions for general audit trail
  async logUserAction(userId, action, details = {}) {
    try {
      await db.execute(
        `INSERT INTO audit_logs (id, user_id, action, details, created_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [uuidv4(), userId, action, JSON.stringify(details)]
      );
    } catch (error) {
      console.error('Error logging user action:', error);
    }
  }

  // Get user audit trail
  async getUserAuditTrail(userId, limit = 50) {
    const [rows] = await db.execute(
      `SELECT * FROM audit_logs 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );
    
    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      action: row.action,
      details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details,
      createdAt: row.created_at
    }));
  }
}

module.exports = new AuditService();
