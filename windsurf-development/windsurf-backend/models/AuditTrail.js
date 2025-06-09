
const db = require('../config/database');

class AuditTrailModel {
  static async create(auditData) {
    const query = `
      INSERT INTO audit_trail (
        id, issue_id, user_id, action, old_value, new_value, 
        metadata, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const [result] = await db.execute(query, [
      auditData.id,
      auditData.issue_id,
      auditData.user_id,
      auditData.action,
      JSON.stringify(auditData.old_value),
      JSON.stringify(auditData.new_value),
      JSON.stringify(auditData.metadata)
    ]);
    
    return this.findById(auditData.id);
  }

  static async findById(id) {
    const query = `
      SELECT a.*, 
        u.name as user_name,
        u.role as user_role,
        i.description as issue_description
      FROM audit_trail a
      LEFT JOIN dashboard_users u ON a.user_id = u.id
      LEFT JOIN issues i ON a.issue_id = i.id
      WHERE a.id = ?
    `;
    
    const [rows] = await db.execute(query, [id]);
    const row = rows[0];
    if (row) {
      row.old_value = JSON.parse(row.old_value || '{}');
      row.new_value = JSON.parse(row.new_value || '{}');
      row.metadata = JSON.parse(row.metadata || '{}');
    }
    return row || null;
  }

  static async findByIssueId(issueId) {
    const query = `
      SELECT a.*, 
        u.name as user_name,
        u.role as user_role
      FROM audit_trail a
      LEFT JOIN dashboard_users u ON a.user_id = u.id
      WHERE a.issue_id = ?
      ORDER BY a.created_at DESC
    `;
    
    const [rows] = await db.execute(query, [issueId]);
    return rows.map(row => ({
      ...row,
      old_value: JSON.parse(row.old_value || '{}'),
      new_value: JSON.parse(row.new_value || '{}'),
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }

  static async getRecentActivity(limit = 50) {
    const query = `
      SELECT a.*, 
        u.name as user_name,
        u.role as user_role,
        i.description as issue_description
      FROM audit_trail a
      LEFT JOIN dashboard_users u ON a.user_id = u.id
      LEFT JOIN issues i ON a.issue_id = i.id
      ORDER BY a.created_at DESC
      LIMIT ?
    `;
    
    const [rows] = await db.execute(query, [limit]);
    return rows.map(row => ({
      ...row,
      old_value: JSON.parse(row.old_value || '{}'),
      new_value: JSON.parse(row.new_value || '{}'),
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }

  static async getActivityStats(filters = {}) {
    let query = `
      SELECT 
        COUNT(*) as total_activities,
        COUNT(DISTINCT user_id) as active_users,
        COUNT(DISTINCT issue_id) as affected_issues,
        action,
        COUNT(*) as action_count
      FROM audit_trail
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.startDate) {
      query += ' AND created_at >= ?';
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      query += ' AND created_at <= ?';
      params.push(filters.endDate);
    }
    
    if (filters.user_id) {
      query += ' AND user_id = ?';
      params.push(filters.user_id);
    }
    
    query += ' GROUP BY action';
    
    const [rows] = await db.execute(query, params);
    return rows;
  }
}

module.exports = AuditTrailModel;
