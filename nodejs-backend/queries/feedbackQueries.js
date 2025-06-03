
const feedbackQueries = {
  submitFeedback: `
    INSERT INTO ticket_feedback 
    (id, issue_id, employee_uuid, sentiment, feedback_option, city, cluster, agent_id, agent_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `,

  getFeedbackByTicket: `
    SELECT * FROM ticket_feedback WHERE issue_id = ?
  `,

  checkFeedbackExists: `
    SELECT id FROM ticket_feedback WHERE issue_id = ? AND employee_uuid = ?
  `,

  getIssueDetails: `
    SELECT 
      i.*,
      du.name as assigned_to_name
    FROM issues i
    LEFT JOIN dashboard_users du ON i.assigned_to = du.id
    WHERE i.id = ?
  `,

  getEmployeeDetails: `
    SELECT city, cluster FROM employees WHERE id = ?
  `
};

module.exports = feedbackQueries;
