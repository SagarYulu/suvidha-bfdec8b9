
const { pool } = require('../config/database');
const emailService = require('./emailService');

class AutoAssignService {
  async autoAssignIssue(issueId) {
    try {
      // Get issue details
      const [issues] = await pool.execute(
        'SELECT * FROM issues WHERE id = ?',
        [issueId]
      );

      if (issues.length === 0) {
        throw new Error('Issue not found');
      }

      const issue = issues[0];

      // Get employee details
      const [employees] = await pool.execute(
        'SELECT * FROM employees WHERE emp_id = ?',
        [issue.employee_uuid]
      );

      if (employees.length === 0) {
        console.log('Employee not found for auto-assignment');
        return;
      }

      const employee = employees[0];

      // Find available agents based on city/cluster
      const [agents] = await pool.execute(`
        SELECT du.*, 
               COUNT(i.id) as current_workload
        FROM dashboard_users du
        LEFT JOIN issues i ON du.employee_id = i.assigned_to AND i.status != 'closed'
        WHERE du.role = 'agent' 
        AND (du.city = ? OR du.cluster = ?)
        GROUP BY du.id
        ORDER BY current_workload ASC, RAND()
        LIMIT 1
      `, [employee.city, employee.cluster]);

      if (agents.length === 0) {
        console.log('No available agents found for auto-assignment');
        return;
      }

      const selectedAgent = agents[0];

      // Assign the issue
      await pool.execute(
        'UPDATE issues SET assigned_to = ?, updated_at = NOW() WHERE id = ?',
        [selectedAgent.employee_id, issueId]
      );

      // Create audit trail
      await pool.execute(`
        INSERT INTO issue_audit_trail (
          issue_id, employee_uuid, action, previous_status, new_status, details
        ) VALUES (?, ?, 'auto_assign', NULL, NULL, ?)
      `, [
        issueId,
        'system',
        JSON.stringify({
          assigned_to: selectedAgent.employee_id,
          agent_name: selectedAgent.name,
          reason: 'auto_assignment'
        })
      ]);

      // Send notification emails
      await emailService.sendAssignmentNotification(issue, selectedAgent, employee);

      console.log(`Issue ${issueId} auto-assigned to ${selectedAgent.name}`);
      return selectedAgent;
    } catch (error) {
      console.error('Auto-assignment error:', error);
      throw error;
    }
  }

  async getWorkloadDistribution() {
    try {
      const [results] = await pool.execute(`
        SELECT 
          du.employee_id,
          du.name,
          du.city,
          du.cluster,
          COUNT(i.id) as current_workload
        FROM dashboard_users du
        LEFT JOIN issues i ON du.employee_id = i.assigned_to AND i.status != 'closed'
        WHERE du.role = 'agent'
        GROUP BY du.id
        ORDER BY current_workload ASC
      `);

      return results;
    } catch (error) {
      console.error('Error getting workload distribution:', error);
      throw error;
    }
  }
}

module.exports = new AutoAssignService();
