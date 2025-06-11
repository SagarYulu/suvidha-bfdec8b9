module.exports = {
  // Issue Types - aligned with frontend src structure
  ISSUE_TYPES: {
    SALARY: 'salary',
    PF: 'pf',
    ESI: 'esi',
    LEAVE: 'leave',
    MANAGER: 'manager',
    FACILITY: 'facility',
    COWORKER: 'coworker',
    PERSONAL: 'personal',
    OTHERS: 'others'
  },

  // Issue Sub Types
  ISSUE_SUB_TYPES: {
    // Salary subtypes
    SALARY_NOT_RECEIVED: 'salary-not-received',
    LESS_SALARY: 'less-salary',
    LOP_INCORRECT: 'lop-incorrect',
    NO_INCENTIVES: 'no-incentives',
    NO_OT: 'no-ot',
    NO_PAYSLIP: 'no-payslip',
    SALARY_ADVANCE: 'salary-advance',
    INCREMENT_NOT_HAPPENED: 'increment-not-happened',
    INCREMENT_WHEN: 'increment-when',
    
    // PF subtypes
    BANK_KYC: 'bank-kyc',
    PF_NAME_CHANGE: 'name-change',
    ADVANCE_REQUEST: 'advance-request',
    PF_TRANSFER: 'pf-transfer',
    NOMINEE_DETAILS: 'nominee-details',
    UAN_ACTIVATION: 'uan-activation',
    NEED_UAN_NUMBER: 'need-uan-number',
    
    // ESI subtypes
    FAMILY_ADDITION: 'family-addition',
    ESI_NOMINEE_CHANGE: 'nominee-change',
    ESI_NAME_CHANGE: 'name-change',
    CHANGE_PERSONAL_DETAILS: 'change-personal-details',
    
    // Leave subtypes
    MANAGER_REJECTED: 'manager-rejected',
    NOT_ADDED: 'not-added',
    
    // Facility subtypes
    NO_WATER: 'no-water',
    WASHROOM_HYGIENE: 'washroom-hygiene',
    
    // Coworker subtypes
    ABUSING: 'abusing',
    THREATENING: 'threatening',
    MANHANDLED: 'manhandled',
    
    // Personal subtypes
    BANK_ACCOUNT: 'bank-account',
    EMAIL_ID: 'email-id',
    PHONE_NUMBER: 'phone-number',
    
    // Others subtypes
    GENERAL_QUERY: 'general-query',
    IT_ISSUE: 'it-issue',
    OTHER_ISSUE: 'other-issue'
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
