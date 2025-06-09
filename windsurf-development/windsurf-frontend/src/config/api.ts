
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me',
      REFRESH: '/api/auth/refresh',
      MOBILE_LOGIN: '/api/auth/mobile-login',
      PROFILE: '/api/auth/profile',
      VERIFY: '/api/auth/verify',
    },
    // Issue endpoints
    ISSUES: {
      BASE: '/api/issues',
      ASSIGN: (id: string) => `/api/issues/${id}/assign`,
      COMMENTS: (id: string) => `/api/issues/${id}/comments`,
      INTERNAL_COMMENTS: (id: string) => `/api/issues/${id}/internal-comments`,
    },
    // User endpoints
    USERS: {
      BASE: '/api/users',
    },
    // Dashboard endpoints
    DASHBOARD: {
      METRICS: '/api/dashboard/metrics',
      CHARTS: '/api/dashboard/charts',
    },
    // File endpoints
    FILES: {
      UPLOAD: '/api/upload',
      DELETE: '/api/upload',
    },
    // Analytics endpoints
    ANALYTICS: {
      BASE: '/api/analytics',
      EXPORT: '/api/analytics/export',
    },
    // Notifications endpoints
    NOTIFICATIONS: {
      BASE: '/api/notifications',
      READ: (id: string) => `/api/notifications/${id}/read`,
    },
    // Health endpoints
    HEALTH: '/api/health',
  },
  TIMEOUT: 30000,
};

export default API_CONFIG;
