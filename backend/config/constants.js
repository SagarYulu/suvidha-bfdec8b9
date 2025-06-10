
module.exports = {
  // Issue Types
  ISSUE_TYPES: {
    GENERAL: 'general',
    BANK_ACCOUNT_CHANGE: 'bank_account_change',
    TECHNICAL: 'technical',
    BILLING: 'billing',
    COMPLAINT: 'complaint',
    REQUEST: 'request'
  },

  // Issue Statuses
  ISSUE_STATUS: {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
    PENDING: 'pending',
    ESCALATED: 'escalated'
  },

  // Priorities
  PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  },

  // User Roles
  USER_ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    AGENT: 'agent',
    EMPLOYEE: 'employee'
  },

  // Permissions
  PERMISSIONS: {
    READ: 'read',
    WRITE: 'write',
    DELETE: 'delete',
    MANAGE_USERS: 'manage_users',
    MANAGE_ROLES: 'manage_roles',
    VIEW_ANALYTICS: 'view_analytics',
    ESCALATE_ISSUES: 'escalate_issues',
    ASSIGN_ISSUES: 'assign_issues'
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

  // File Upload
  UPLOAD: {
    MAX_SIZE: parseInt(process.env.UPLOAD_MAX_SIZE) || 10485760, // 10MB
    ALLOWED_TYPES: (process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(',')
  },

  // JWT
  JWT: {
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    REFRESH_EXPIRES_IN: '7d'
  }
};
