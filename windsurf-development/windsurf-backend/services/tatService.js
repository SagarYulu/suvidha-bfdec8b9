
const { pool } = require('../config/database');

class TATService {
  // Get TAT metrics with SLA compliance buckets
  async getTATMetrics(filters = {}) {
    try {
      const { startDate, endDate, city, cluster, priority } = filters;
      
      let query = `
        SELECT 
          COUNT(*) as total_issues,
          SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_issues,
          SUM(CASE WHEN status != 'closed' THEN 1 ELSE 0 END) as open_issues,
          AVG(CASE 
            WHEN closed_at IS NOT NULL 
            THEN DATEDIFF(closed_at, created_at) 
            ELSE DATEDIFF(NOW(), created_at) 
          END) as avg_tat_days,
          
          -- SLA Compliance Buckets
          SUM(CASE 
            WHEN DATEDIFF(COALESCE(closed_at, NOW()), created_at) <= 14 
            THEN 1 ELSE 0 
          END) as within_14_days,
          
          SUM(CASE 
            WHEN DATEDIFF(COALESCE(closed_at, NOW()), created_at) BETWEEN 15 AND 30 
            THEN 1 ELSE 0 
          END) as within_15_30_days,
          
          SUM(CASE 
            WHEN DATEDIFF(COALESCE(closed_at, NOW()), created_at) > 30 
            THEN 1 ELSE 0 
          END) as beyond_30_days
          
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (startDate) {
        query += ' AND i.created_at >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        query += ' AND i.created_at <= ?';
        params.push(endDate);
      }
      
      if (city) {
        query += ' AND e.city = ?';
        params.push(city);
      }
      
      if (cluster) {
        query += ' AND e.cluster = ?';
        params.push(cluster);
      }

      if (priority) {
        query += ' AND i.priority = ?';
        params.push(priority);
      }
      
      const [results] = await pool.execute(query, params);
      const metrics = results[0];

      // Calculate SLA compliance percentage
      const totalIssues = metrics.total_issues || 0;
      const slaCompliant = metrics.within_14_days || 0;
      const slaComplianceRate = totalIssues > 0 ? (slaCompliant / totalIssues) * 100 : 0;

      return {
        totalIssues: metrics.total_issues || 0,
        openIssues: metrics.open_issues || 0,
        closedIssues: metrics.closed_issues || 0,
        avgTATDays: Math.round((metrics.avg_tat_days || 0) * 10) / 10,
        slaCompliance: {
          within14Days: metrics.within_14_days || 0,
          within15To30Days: metrics.within_15_30_days || 0,
          beyond30Days: metrics.beyond_30_days || 0,
          complianceRate: Math.round(slaComplianceRate * 10) / 10
        }
      };
    } catch (error) {
      console.error('Error calculating TAT metrics:', error);
      throw error;
    }
  }

  // Get TAT trend data for charts
  async getTATTrendData(days = 30) {
    try {
      const query = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as issues_created,
          SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as issues_closed,
          AVG(CASE 
            WHEN closed_at IS NOT NULL 
            THEN DATEDIFF(closed_at, created_at) 
            ELSE NULL 
          END) as avg_resolution_days
        FROM issues 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;

      const [results] = await pool.execute(query, [days]);
      
      return results.map(row => ({
        date: row.date,
        issuesCreated: row.issues_created,
        issuesClosed: row.issues_closed,
        avgResolutionDays: row.avg_resolution_days ? Math.round(row.avg_resolution_days * 10) / 10 : null
      }));
    } catch (error) {
      console.error('Error getting TAT trend data:', error);
      throw error;
    }
  }

  // Get SLA breach details
  async getSLABreaches(filters = {}) {
    try {
      const { priority, assignedTo } = filters;
      
      let query = `
        SELECT 
          i.id,
          i.type_id,
          i.sub_type_id,
          i.priority,
          i.status,
          i.created_at,
          i.closed_at,
          i.assigned_to,
          e.name as employee_name,
          e.emp_id,
          DATEDIFF(COALESCE(i.closed_at, NOW()), i.created_at) as age_days,
          CASE 
            WHEN DATEDIFF(COALESCE(i.closed_at, NOW()), i.created_at) > 30 THEN 'Critical'
            WHEN DATEDIFF(COALESCE(i.closed_at, NOW()), i.created_at) > 14 THEN 'Breach'
            ELSE 'Compliant'
          END as sla_status
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE DATEDIFF(COALESCE(i.closed_at, NOW()), i.created_at) > 14
      `;
      
      const params = [];
      
      if (priority) {
        query += ' AND i.priority = ?';
        params.push(priority);
      }
      
      if (assignedTo) {
        query += ' AND i.assigned_to = ?';
        params.push(assignedTo);
      }
      
      query += ' ORDER BY age_days DESC LIMIT 100';
      
      const [results] = await pool.execute(query, params);
      return results;
    } catch (error) {
      console.error('Error getting SLA breaches:', error);
      throw error;
    }
  }

  // Get performance by team/agent
  async getTeamPerformance() {
    try {
      const query = `
        SELECT 
          i.assigned_to,
          du.name as agent_name,
          COUNT(*) as total_assigned,
          SUM(CASE WHEN i.status = 'closed' THEN 1 ELSE 0 END) as closed_count,
          AVG(CASE 
            WHEN i.closed_at IS NOT NULL 
            THEN DATEDIFF(i.closed_at, i.created_at) 
            ELSE NULL 
          END) as avg_resolution_days,
          SUM(CASE 
            WHEN DATEDIFF(COALESCE(i.closed_at, NOW()), i.created_at) <= 14 
            THEN 1 ELSE 0 
          END) as sla_compliant
        FROM issues i
        LEFT JOIN dashboard_users du ON i.assigned_to = du.id
        WHERE i.assigned_to IS NOT NULL
        GROUP BY i.assigned_to, du.name
        ORDER BY total_assigned DESC
      `;

      const [results] = await pool.execute(query);
      
      return results.map(row => ({
        agentId: row.assigned_to,
        agentName: row.agent_name || 'Unknown',
        totalAssigned: row.total_assigned,
        closedCount: row.closed_count,
        avgResolutionDays: row.avg_resolution_days ? Math.round(row.avg_resolution_days * 10) / 10 : null,
        slaCompliantCount: row.sla_compliant,
        resolutionRate: row.total_assigned > 0 ? Math.round((row.closed_count / row.total_assigned) * 100) : 0,
        slaComplianceRate: row.total_assigned > 0 ? Math.round((row.sla_compliant / row.total_assigned) * 100) : 0
      }));
    } catch (error) {
      console.error('Error getting team performance:', error);
      throw error;
    }
  }
}

module.exports = new TATService();
