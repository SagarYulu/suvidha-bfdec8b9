
const { pool } = require('../config/database');
const emailService = require('./actualEmailService');
const auditController = require('../controllers/auditController');

class AutoAssignService {
  constructor() {
    this.assignmentRules = {
      'critical': { maxLoad: 3, roles: ['admin', 'manager'] },
      'high': { maxLoad: 5, roles: ['admin', 'manager', 'agent'] },
      'medium': { maxLoad: 8, roles: ['agent', 'manager'] },
      'low': { maxLoad: 10, roles: ['agent'] }
    };
  }

  async autoAssignIssue(issueId) {
    try {
      console.log(`Starting auto-assignment for issue: ${issueId}`);

      // Get issue details
      const [issue] = await pool.execute(`
        SELECT i.*, e.city, e.cluster 
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE i.id = ?
      `, [issueId]);

      if (issue.length === 0) {
        throw new Error('Issue not found');
      }

      const issueData = issue[0];

      if (issueData.assigned_to) {
        console.log(`Issue ${issueId} already assigned to ${issueData.assigned_to}`);
        return null;
      }

      // Find best assignee
      const assignee = await this.findBestAssignee(issueData);

      if (!assignee) {
        console.log(`No suitable assignee found for issue ${issueId}`);
        return null;
      }

      // Assign the issue
      await pool.execute(`
        UPDATE issues 
        SET assigned_to = ?, updated_at = NOW()
        WHERE id = ?
      `, [assignee.id, issueId]);

      // Log assignment in audit trail
      await auditController.logAction(
        'auto_assigned',
        issueId,
        'system',
        {
          assigned_to: assignee.id,
          assignee_name: assignee.name,
          assignment_reason: 'auto_assignment',
          workload: assignee.current_load
        }
      );

      // Send email notification
      try {
        await emailService.sendIssueAssignmentEmail(
          assignee.email,
          assignee.name,
          issueData
        );
      } catch (emailError) {
        console.error('Failed to send assignment email:', emailError);
      }

      console.log(`Issue ${issueId} auto-assigned to ${assignee.name} (${assignee.email})`);
      return assignee;

    } catch (error) {
      console.error('Auto assignment error:', error);
      throw error;
    }
  }

  async findBestAssignee(issue) {
    try {
      const priority = issue.priority;
      const city = issue.city;
      const cluster = issue.cluster;

      const rules = this.assignmentRules[priority];
      if (!rules) {
        console.error(`No assignment rules found for priority: ${priority}`);
        return null;
      }

      // Build role filter
      const roleFilter = rules.roles.map(() => '?').join(',');
      
      // Find available agents with their current workload
      const [agents] = await pool.execute(`
        SELECT 
          du.id,
          du.name,
          du.email,
          du.role,
          du.city as agent_city,
          du.cluster as agent_cluster,
          COUNT(i.id) as current_load
        FROM dashboard_users du
        LEFT JOIN issues i ON i.assigned_to = du.id 
          AND i.status NOT IN ('closed', 'resolved')
        WHERE du.role IN (${roleFilter})
          AND du.id IS NOT NULL
        GROUP BY du.id, du.name, du.email, du.role, du.city, du.cluster
        HAVING current_load < ?
        ORDER BY 
          CASE 
            WHEN du.city = ? THEN 1 
            ELSE 2 
          END,
          CASE 
            WHEN du.cluster = ? THEN 1 
            ELSE 2 
          END,
          current_load ASC,
          RAND()
        LIMIT 1
      `, [...rules.roles, rules.maxLoad, city, cluster]);

      if (agents.length === 0) {
        // No agents available within load limits, try with higher capacity
        console.log(`No agents within load limit for priority ${priority}, trying with relaxed rules`);
        
        const [backupAgents] = await pool.execute(`
          SELECT 
            du.id,
            du.name,
            du.email,
            du.role,
            COUNT(i.id) as current_load
          FROM dashboard_users du
          LEFT JOIN issues i ON i.assigned_to = du.id 
            AND i.status NOT IN ('closed', 'resolved')
          WHERE du.role IN (${roleFilter})
          GROUP BY du.id, du.name, du.email, du.role
          ORDER BY current_load ASC, RAND()
          LIMIT 1
        `, rules.roles);

        return backupAgents.length > 0 ? backupAgents[0] : null;
      }

      return agents[0];

    } catch (error) {
      console.error('Error finding best assignee:', error);
      throw error;
    }
  }

  async getAssignmentStats() {
    try {
      const [stats] = await pool.execute(`
        SELECT 
          du.role,
          du.name,
          COUNT(i.id) as assigned_issues,
          COUNT(CASE WHEN i.status IN ('resolved', 'closed') THEN 1 END) as resolved_issues,
          AVG(CASE WHEN i.status IN ('resolved', 'closed') 
              THEN TIMESTAMPDIFF(HOUR, i.created_at, i.closed_at) END) as avg_resolution_hours
        FROM dashboard_users du
        LEFT JOIN issues i ON i.assigned_to = du.id
        WHERE du.role IN ('admin', 'manager', 'agent')
        GROUP BY du.id, du.role, du.name
        ORDER BY du.role, assigned_issues DESC
      `);

      return stats;
    } catch (error) {
      console.error('Error getting assignment stats:', error);
      throw error;
    }
  }

  async rebalanceWorkload() {
    try {
      console.log('Starting workload rebalancing...');

      // Find overloaded agents
      const [overloadedAgents] = await pool.execute(`
        SELECT 
          du.id,
          du.name,
          du.role,
          COUNT(i.id) as current_load
        FROM dashboard_users du
        LEFT JOIN issues i ON i.assigned_to = du.id 
          AND i.status NOT IN ('closed', 'resolved')
        WHERE du.role IN ('admin', 'manager', 'agent')
        GROUP BY du.id, du.name, du.role
        HAVING current_load > 10
        ORDER BY current_load DESC
      `);

      let rebalancedCount = 0;

      for (const agent of overloadedAgents) {
        // Get oldest unresolved issues from this agent
        const [issues] = await pool.execute(`
          SELECT id, priority, created_at
          FROM issues 
          WHERE assigned_to = ? 
            AND status NOT IN ('closed', 'resolved')
          ORDER BY created_at ASC
          LIMIT 3
        `, [agent.id]);

        for (const issue of issues) {
          // Try to reassign to less loaded agent
          const newAssignee = await this.findBestAssignee({
            priority: issue.priority,
            city: null, // Remove city preference for rebalancing
            cluster: null
          });

          if (newAssignee && newAssignee.id !== agent.id) {
            await pool.execute(`
              UPDATE issues 
              SET assigned_to = ?, updated_at = NOW()
              WHERE id = ?
            `, [newAssignee.id, issue.id]);

            await auditController.logAction(
              'reassigned',
              issue.id,
              'system',
              {
                from_agent: agent.id,
                to_agent: newAssignee.id,
                reason: 'workload_rebalancing'
              }
            );

            rebalancedCount++;
          }
        }
      }

      console.log(`Workload rebalancing completed. ${rebalancedCount} issues reassigned.`);
      return rebalancedCount;

    } catch (error) {
      console.error('Error rebalancing workload:', error);
      throw error;
    }
  }

  async updateAssignmentRules(priority, maxLoad, roles) {
    try {
      this.assignmentRules[priority] = { maxLoad, roles };
      console.log(`Assignment rules updated for priority ${priority}:`, { maxLoad, roles });
    } catch (error) {
      console.error('Error updating assignment rules:', error);
      throw error;
    }
  }
}

module.exports = new AutoAssignService();
