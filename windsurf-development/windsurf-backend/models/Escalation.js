
const db = require('../config/database');

class EscalationModel {
  static async create(escalationData) {
    const query = `
      INSERT INTO escalations (
        id, issue_id, escalated_from, escalated_to, escalation_type, 
        reason, escalated_at, resolved_at, status, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      escalationData.id,
      escalationData.issue_id,
      escalationData.escalated_from,
      escalationData.escalated_to,
      escalationData.escalation_type,
      escalationData.reason,
      escalationData.escalated_at,
      escalationData.resolved_at,
      escalationData.status,
      escalationData.created_by
    ]);
    
    return this.findById(escalationData.id);
  }

  static async findById(id) {
    const query = `
      SELECT e.*, 
        i.description as issue_description,
        u1.name as escalated_from_name,
        u2.name as escalated_to_name,
        u3.name as created_by_name
      FROM escalations e
      LEFT JOIN issues i ON e.issue_id = i.id
      LEFT JOIN dashboard_users u1 ON e.escalated_from = u1.id
      LEFT JOIN dashboard_users u2 ON e.escalated_to = u2.id
      LEFT JOIN dashboard_users u3 ON e.created_by = u3.id
      WHERE e.id = ?
    `;
    
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  }

  static async findByIssueId(issueId) {
    const query = `
      SELECT e.*, 
        u1.name as escalated_from_name,
        u2.name as escalated_to_name,
        u3.name as created_by_name
      FROM escalations e
      LEFT JOIN dashboard_users u1 ON e.escalated_from = u1.id
      LEFT JOIN dashboard_users u2 ON e.escalated_to = u2.id
      LEFT JOIN dashboard_users u3 ON e.created_by = u3.id
      WHERE e.issue_id = ?
      ORDER BY e.escalated_at DESC
    `;
    
    const [rows] = await db.execute(query, [issueId]);
    return rows;
  }

  static async getPendingEscalations() {
    const query = `
      SELECT e.*, 
        i.description as issue_description,
        i.priority as issue_priority,
        u1.name as escalated_from_name,
        u2.name as escalated_to_name
      FROM escalations e
      LEFT JOIN issues i ON e.issue_id = i.id
      LEFT JOIN dashboard_users u1 ON e.escalated_from = u1.id
      LEFT JOIN dashboard_users u2 ON e.escalated_to = u2.id
      WHERE e.status = 'pending'
      ORDER BY e.escalated_at ASC
    `;
    
    const [rows] = await db.execute(query);
    return rows;
  }

  static async resolveEscalation(id, resolvedBy) {
    const query = `
      UPDATE escalations 
      SET status = 'resolved', resolved_at = NOW(), resolved_by = ?
      WHERE id = ?
    `;
    
    await db.execute(query, [resolvedBy, id]);
    return this.findById(id);
  }

  static async getEscalationStats(filters = {}) {
    let query = `
      SELECT 
        COUNT(*) as total_escalations,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_escalations,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_escalations,
        AVG(TIMESTAMPDIFF(HOUR, escalated_at, resolved_at)) as avg_resolution_hours
      FROM escalations
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.startDate) {
      query += ' AND escalated_at >= ?';
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      query += ' AND escalated_at <= ?';
      params.push(filters.endDate);
    }
    
    const [rows] = await db.execute(query, params);
    return rows[0];
  }
}

module.exports = EscalationModel;
