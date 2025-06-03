
const analyticsQueries = {
  getTotalIssues: `
    SELECT COUNT(*) as count FROM issues
  `,

  getOpenIssues: `
    SELECT COUNT(*) as count FROM issues WHERE status IN ('open', 'in_progress')
  `,

  getResolvedIssues: `
    SELECT COUNT(*) as count FROM issues WHERE status IN ('resolved', 'closed')
  `,

  getIssuesByPriority: `
    SELECT priority, COUNT(*) as count 
    FROM issues 
    GROUP BY priority
  `,

  getIssuesByStatus: `
    SELECT status, COUNT(*) as count 
    FROM issues 
    GROUP BY status
  `,

  getRecentIssues: `
    SELECT 
      i.*,
      e.name as employee_name,
      e.emp_id as employee_id
    FROM issues i
    LEFT JOIN employees e ON i.employee_uuid = e.id
    ORDER BY i.created_at DESC
    LIMIT 10
  `,

  getIssuesTrend: `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as count
    FROM issues
    GROUP BY date 
    ORDER BY date
  `,

  getIssuesTrendWithDateFilter: `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as count
    FROM issues
    WHERE DATE(created_at) BETWEEN ? AND ?
    GROUP BY date 
    ORDER BY date
  `,

  getAvgResolutionTime: `
    SELECT 
      AVG(TIMESTAMPDIFF(HOUR, created_at, closed_at)) as avg_resolution_hours
    FROM issues 
    WHERE closed_at IS NOT NULL
  `,

  getAgentPerformance: `
    SELECT 
      du.name as agent_name,
      COUNT(i.id) as total_assigned,
      COUNT(CASE WHEN i.status IN ('resolved', 'closed') THEN 1 END) as resolved_count,
      AVG(CASE WHEN i.closed_at IS NOT NULL 
          THEN TIMESTAMPDIFF(HOUR, i.created_at, i.closed_at) 
          END) as avg_resolution_hours
    FROM dashboard_users du
    LEFT JOIN issues i ON du.id = i.assigned_to
    WHERE du.role IN ('agent', 'manager') AND du.deleted_at IS NULL
    GROUP BY du.id, du.name
    HAVING total_assigned > 0
  `
};

module.exports = analyticsQueries;
