module.exports = {
  // Issue Types - synced with frontend
  ISSUE_TYPES: {
    SALARY: 'salary',
    VEHICLE: 'vehicle',
    APP: 'app',
    DOCUMENTATION: 'documentation',
    BANK_ACCOUNT: 'bank_account',
    TRAINING: 'training',
    OTHER: 'other'
  },

  // Issue Sub Types - synced with frontend
  ISSUE_SUB_TYPES: {
    // Salary subtypes
    SALARY_DELAY: 'salary_delay',
    SALARY_DEDUCTION: 'salary_deduction',
    INCENTIVE_ISSUE: 'incentive_issue',
    
    // Vehicle subtypes
    VEHICLE_BREAKDOWN: 'vehicle_breakdown',
    BATTERY_ISSUE: 'battery_issue',
    MAINTENANCE: 'maintenance',
    
    // App subtypes
    LOGIN_ISSUE: 'login_issue',
    BOOKING_ISSUE: 'booking_issue',
    PAYMENT_ISSUE: 'payment_issue',
    
    // Documentation subtypes
    LICENSE_ISSUE: 'license_issue',
    KYC_ISSUE: 'kyc_issue',
    PROFILE_UPDATE: 'profile_update',
    
    // Bank account subtypes
    ACCOUNT_CHANGE: 'account_change',
    PAYMENT_FAILURE: 'payment_failure',
    
    // Training subtypes
    TRAINING_REQUEST: 'training_request',
    CERTIFICATION: 'certification',
    
    // Other subtypes
    GENERAL_QUERY: 'general_query',
    FEEDBACK: 'feedback',
    COMPLAINT: 'complaint'
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
