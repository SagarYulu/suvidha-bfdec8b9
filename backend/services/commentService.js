
const { getPool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class CommentService {
  /**
   * Add a public comment to an issue
   */
  static async addPublicComment(issueId, employeeUuid, content) {
    const pool = getPool();
    const commentId = uuidv4();
    
    try {
      await pool.execute(`
        INSERT INTO issue_comments (id, issue_id, employee_uuid, content, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `, [commentId, issueId, employeeUuid, content]);
      
      // Add audit trail entry
      await pool.execute(`
        INSERT INTO issue_audit_trail (issue_id, employee_uuid, action, details)
        VALUES (?, ?, 'comment_added', ?)
      `, [issueId, employeeUuid, JSON.stringify({ comment_id: commentId, is_internal: false })]);
      
      return { id: commentId, success: true };
    } catch (error) {
      console.error('Error adding public comment:', error);
      throw error;
    }
  }

  /**
   * Add an internal comment to an issue
   */
  static async addInternalComment(issueId, employeeUuid, content) {
    const pool = getPool();
    const commentId = uuidv4();
    
    try {
      await pool.execute(`
        INSERT INTO issue_internal_comments (id, issue_id, employee_uuid, content, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `, [commentId, issueId, employeeUuid, content]);
      
      // The trigger will handle the audit trail automatically
      return { id: commentId, success: true };
    } catch (error) {
      console.error('Error adding internal comment:', error);
      throw error;
    }
  }

  /**
   * Get all comments for an issue (public only for employees, all for dashboard users)
   */
  static async getIssueComments(issueId, userRole = 'employee') {
    const pool = getPool();
    
    try {
      let publicComments = [];
      let internalComments = [];
      
      // Always get public comments
      const [publicRows] = await pool.execute(`
        SELECT 
          ic.*,
          e.name as employee_name
        FROM issue_comments ic
        LEFT JOIN employees e ON ic.employee_uuid = e.id
        WHERE ic.issue_id = ?
        ORDER BY ic.created_at ASC
      `, [issueId]);
      
      publicComments = publicRows;
      
      // Get internal comments only for dashboard users
      if (userRole !== 'employee') {
        const [internalRows] = await pool.execute(`
          SELECT 
            iic.*,
            e.name as employee_name
          FROM issue_internal_comments iic
          LEFT JOIN employees e ON iic.employee_uuid = e.id
          WHERE iic.issue_id = ?
          ORDER BY iic.created_at ASC
        `, [issueId]);
        
        internalComments = internalRows;
      }
      
      return {
        public_comments: publicComments,
        internal_comments: internalComments
      };
    } catch (error) {
      console.error('Error fetching issue comments:', error);
      throw error;
    }
  }

  /**
   * Update a comment (only by the author or admin)
   */
  static async updateComment(commentId, content, employeeUuid, isInternal = false) {
    const pool = getPool();
    
    try {
      const table = isInternal ? 'issue_internal_comments' : 'issue_comments';
      
      const [result] = await pool.execute(`
        UPDATE ${table} 
        SET content = ?, updated_at = NOW()
        WHERE id = ? AND employee_uuid = ?
      `, [content, commentId, employeeUuid]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  /**
   * Delete a comment (only by the author or admin)
   */
  static async deleteComment(commentId, employeeUuid, isInternal = false) {
    const pool = getPool();
    
    try {
      const table = isInternal ? 'issue_internal_comments' : 'issue_comments';
      
      const [result] = await pool.execute(`
        DELETE FROM ${table}
        WHERE id = ? AND employee_uuid = ?
      `, [commentId, employeeUuid]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
}

module.exports = CommentService;
