
export const formatConsistentIssueData = (issues: any[]) => {
  return issues.map(issue => ({
    id: issue.id,
    title: issue.title || issue.description?.substring(0, 50) + '...',
    status: issue.status,
    priority: issue.priority || 'medium',
    createdAt: issue.createdAt || issue.created_at,
    assignedTo: issue.assignedTo || issue.assigned_to,
    issueType: issue.issueType || issue.issue_type || issue.type,
    description: issue.description,
    employeeId: issue.employeeId || issue.employee_id,
    city: issue.city,
    cluster: issue.cluster,
    updatedAt: issue.updatedAt || issue.updated_at,
  }));
};

export const formatIssueForAPI = (issue: any) => {
  return {
    title: issue.title,
    description: issue.description,
    issueType: issue.issueType,
    priority: issue.priority || 'medium',
    status: issue.status || 'open',
    employeeId: issue.employeeId,
    city: issue.city,
    cluster: issue.cluster,
    assignedTo: issue.assignedTo || null,
  };
};
