const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

const ISSUE_TYPES = {
  SALARY: 'salary',
  VEHICLE: 'vehicle',
  APP: 'app',
  DOCUMENTATION: 'documentation',
  BANK_ACCOUNT: 'bank_account',
  TRAINING: 'training',
  OTHER: 'other'
};

const ISSUE_SUBTYPES = {
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
};

const ISSUE_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  PENDING: 'pending',
  ESCALATED: 'escalated'
};

const ISSUE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  AGENT: 'agent',
  EMPLOYEE: 'employee'
};

module.exports = {
  HTTP_STATUS,
  ISSUE_TYPES,
  ISSUE_SUBTYPES,
  ISSUE_STATUS,
  ISSUE_PRIORITY,
  USER_ROLES
};
