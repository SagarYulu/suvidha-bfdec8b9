
// Issue statuses
const ISSUE_STATUSES = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

// Issue priorities
const ISSUE_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// User roles
const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  AGENT: 'agent',
  EMPLOYEE: 'employee'
};

// Issue types
const ISSUE_TYPES = {
  SALARY: 'salary',
  BANK_ACCOUNT: 'bank-account',
  OTHERS: 'others'
};

// Issue sub-types
const ISSUE_SUB_TYPES = {
  SALARY: {
    ADVANCE: 'salary-advance',
    DELAY: 'salary-delay',
    DEDUCTION: 'salary-deduction'
  },
  BANK_ACCOUNT: {
    CHANGE: 'account-change',
    UPDATE: 'account-update'
  },
  OTHERS: {
    GENERAL: 'general-inquiry',
    TECHNICAL: 'technical-issue'
  }
};

// Feedback sentiments
const FEEDBACK_SENTIMENTS = {
  HAPPY: 'happy',
  NEUTRAL: 'neutral',
  SAD: 'sad'
};

// File upload settings
const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
  UPLOAD_PATH: './uploads'
};

// API response messages
const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login successful',
    LOGOUT: 'Logout successful',
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully'
  },
  ERROR: {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Insufficient permissions',
    NOT_FOUND: 'Resource not found',
    VALIDATION: 'Validation error',
    INTERNAL: 'Internal server error',
    DUPLICATE: 'Resource already exists'
  }
};

module.exports = {
  ISSUE_STATUSES,
  ISSUE_PRIORITIES,
  USER_ROLES,
  ISSUE_TYPES,
  ISSUE_SUB_TYPES,
  FEEDBACK_SENTIMENTS,
  FILE_UPLOAD,
  MESSAGES
};
