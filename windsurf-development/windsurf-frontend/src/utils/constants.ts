
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
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'File type is not supported.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  ISSUE_CREATED: 'Issue created successfully.',
  ISSUE_UPDATED: 'Issue updated successfully.',
  COMMENT_ADDED: 'Comment added successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  FILE_UPLOADED: 'File uploaded successfully.',
  USER_CREATED: 'User created successfully.',
  USER_UPDATED: 'User updated successfully.',
} as const;

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 8 characters long.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
} as const;

// API Response Status
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

export default {
  ISSUE_STATUS,
  ISSUE_PRIORITY,
  USER_ROLES,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_MESSAGES,
  API_STATUS,
  PAGINATION,
};
