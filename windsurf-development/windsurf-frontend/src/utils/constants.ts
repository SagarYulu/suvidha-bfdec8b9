
// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  MOBILE_LOGIN: '/auth/mobile-login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  PROFILE: '/auth/profile',
  
  // Issues
  ISSUES: '/issues',
  ISSUE_COMMENTS: (id: string) => `/issues/${id}/comments`,
  ISSUE_INTERNAL_COMMENTS: (id: string) => `/issues/${id}/internal-comments`,
  ISSUE_ASSIGN: (id: string) => `/issues/${id}/assign`,
  
  // Mobile
  MOBILE_ISSUES: '/mobile/issues',
  MOBILE_PROFILE: '/mobile/profile',
  
  // Users
  USERS: '/users',
  DASHBOARD_USERS: '/dashboard-users',
  
  // Analytics
  ANALYTICS: '/analytics',
  DASHBOARD_METRICS: '/dashboard/metrics',
  
  // Feedback
  FEEDBACK: '/feedback',
  
  // Files
  UPLOAD: '/upload',
  FILES: '/files',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  
  // Health
  HEALTH: '/health',
};

// Status Constants
export const ISSUE_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  ESCALATED: 'escalated',
} as const;

export const ISSUE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  AGENT: 'agent',
  EMPLOYEE: 'employee',
  SUPER_ADMIN: 'Super Admin',
  CITY_HEAD: 'City Head',
  CLUSTER_HEAD: 'Cluster Head',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'user',
  AUTH_STATE: 'authState',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  ISSUE_CREATED: 'Issue created successfully.',
  ISSUE_UPDATED: 'Issue updated successfully.',
  COMMENT_ADDED: 'Comment added successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
} as const;

export default {
  API_ENDPOINTS,
  ISSUE_STATUS,
  ISSUE_PRIORITY,
  USER_ROLES,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
