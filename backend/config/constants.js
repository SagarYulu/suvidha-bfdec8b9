
module.exports = {
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

  JWT: {
    SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production',
    EXPIRES_IN: '24h',
    REFRESH_EXPIRES_IN: '7d'
  },

  ISSUE_TYPES: {
    HR: 'hr',
    TECHNICAL: 'tech', 
    OPERATIONS: 'ops',
    FINANCE: 'finance'
  },

  ISSUE_SUBTYPES: {
    PAYROLL: 'payroll',
    LEAVE: 'leave',
    PERFORMANCE: 'performance',
    TRAINING: 'training',
    SYSTEM: 'system',
    ACCESS: 'access'
  },

  ISSUE_PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  },

  ISSUE_STATUS: {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
    PENDING: 'pending',
    ESCALATED: 'escalated'
  },

  USER_ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    AGENT: 'agent',
    EMPLOYEE: 'employee'
  },

  UPLOAD_LIMITS: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/csv']
  }
};
