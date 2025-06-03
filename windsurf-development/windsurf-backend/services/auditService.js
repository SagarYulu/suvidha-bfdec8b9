
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class AuditService {
  async logAction(auditData, connection = null) {
    const conn = connection || db;
    
    try {
      await conn.execute(`
        INSERT INTO issue_audit_trail (
          id, issue_id, employee_uuid, action, previous_status, 
          new_status, details, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        uuidv4(),
        auditData.issueId,
        auditData.userId,
        auditData.action,
        auditData.previousStatus || null,
        auditData.newStatus || null,
        JSON.stringify(auditData.details || {})
      ]);
      
      console.log(`Audit logged: ${auditData.action} for issue ${auditData.issueId}`);
      
    } catch (error) {
      console.error('Error logging audit trail:', error);
      throw error;
    }
  }
  
  async getAuditTrail(issueId = null, limit = 100) {
    try {
      let query = `
        SELECT 
          at.*,
          COALESCE(e.name, du.name) as performer_name,
          COALESCE(e.email, du.email) as performer_email
        FROM issue_audit_trail at
        LEFT JOIN employees e ON at.employee_uuid = e.id
        LEFT JOIN dashboard_users du ON at.employee_uuid = du.id
      `;
      
      const params = [];
      
      if (issueId) {
        query += ' WHERE at.issue_id = ?';
        params.push(issueId);
      }
      
      query += ' ORDER BY at.created_at DESC LIMIT ?';
      params.push(limit);
      
      const [auditTrail] = await db.execute(query, params);
      return auditTrail;
      
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      return [];
    }
  }
  
  async logUserAction(userId, action, entityType, entityId, details = {}) {
    try {
      await db.execute(`
        INSERT INTO dashboard_user_audit_logs (
          id, entity_type, entity_id, action, changes, performed_by, performed_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [
        uuidv4(),
        entityType,
        entityId,
        action,
        JSON.stringify(details),
        userId
      ]);
      
    } catch (error) {
      console.error('Error logging user action:', error);
    }
  }
}

module.exports = new AuditService();
