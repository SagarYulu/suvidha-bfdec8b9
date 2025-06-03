
const issueQueries = {
  getAllIssues: `
    SELECT 
      i.*,
      e.name as employee_name,
      e.emp_id as employee_id,
      e.city,
      e.cluster,
      e.manager as manager_name,
      du.name as assigned_to_name
    FROM issues i
    LEFT JOIN employees e ON i.employee_uuid = e.id
    LEFT JOIN dashboard_users du ON i.assigned_to = du.id
  `,

  getIssueById: `
    SELECT 
      i.*,
      e.name as employee_name,
      e.emp_id as employee_id,
      e.city,
      e.cluster,
      e.manager as manager_name,
      du.name as assigned_to_name
    FROM issues i
    LEFT JOIN employees e ON i.employee_uuid = e.id
    LEFT JOIN dashboard_users du ON i.assigned_to = du.id
    WHERE i.id = ?
  `,

  createIssue: `
    INSERT INTO issues 
    (id, employee_uuid, type_id, sub_type_id, description, status, priority, attachments, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `,

  updateIssueStatus: `
    UPDATE issues 
    SET status = ?, closed_at = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `,

  assignIssue: `
    UPDATE issues 
    SET assigned_to = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `,

  getIssueComments: `
    SELECT 
      ic.*,
      COALESCE(e.name, du.name) as commenter_name
    FROM issue_comments ic
    LEFT JOIN employees e ON ic.employee_uuid = e.id
    LEFT JOIN dashboard_users du ON ic.employee_uuid = du.id
    WHERE ic.issue_id = ?
    ORDER BY ic.created_at ASC
  `,

  addComment: `
    INSERT INTO issue_comments 
    (id, issue_id, employee_uuid, content, created_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `,

  getEmployeeIssues: `
    SELECT 
      i.*,
      e.name as employee_name,
      e.emp_id as employee_id,
      du.name as assigned_to_name
    FROM issues i
    LEFT JOIN employees e ON i.employee_uuid = e.id
    LEFT JOIN dashboard_users du ON i.assigned_to = du.id
    WHERE i.employee_uuid = ?
    ORDER BY i.created_at DESC
  `,

  createAuditTrail: `
    INSERT INTO issue_audit_trail 
    (id, issue_id, employee_uuid, action, previous_status, new_status, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `
};

module.exports = issueQueries;
