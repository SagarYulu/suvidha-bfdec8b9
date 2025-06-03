
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  EMPLOYEE_LOGIN: '/auth/employee/login',
  VERIFY: '/auth/verify',
  
  // Issue endpoints
  ISSUES: '/issues',
  ISSUE_COMMENTS: (id: string) => `/issues/${id}/comments`,
  ISSUE_STATUS: (id: string) => `/issues/${id}/status`,
  ISSUE_ASSIGN: (id: string) => `/issues/${id}/assign`,
  EMPLOYEE_ISSUES: '/issues/employee/my-issues',
  UPLOAD: '/upload',
  
  // User endpoints
  USERS: '/users',
  USER: (id: string) => `/users/${id}`,
  EMPLOYEES: '/users/employees',
  
  // Analytics endpoints
  ANALYTICS: '/analytics/dashboard',
  DASHBOARD_ANALYTICS: '/analytics/dashboard',
  USER_ANALYTICS: (id: string) => `/analytics/user/${id}`,
} as const;
