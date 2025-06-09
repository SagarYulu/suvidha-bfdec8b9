
const ISSUE_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

const ISSUE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  AGENT: 'agent',
  EMPLOYEE: 'employee'
};

const FEEDBACK_SENTIMENT = {
  POSITIVE: 'positive',
  NEUTRAL: 'neutral',
  NEGATIVE: 'negative'
};

const ALLOWED_FILE_TYPES = ['jpeg', 'jpg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'];

module.exports = {
  ISSUE_STATUS,
  ISSUE_PRIORITY,
  USER_ROLES,
  FEEDBACK_SENTIMENT,
  ALLOWED_FILE_TYPES
};
