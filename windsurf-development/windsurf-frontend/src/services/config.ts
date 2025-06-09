
// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Authentication Configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'authToken',
  USER_KEY: 'user',
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Yulu Suvidha Portal',
  VERSION: '1.0.0',
  ENVIRONMENT: import.meta.env.MODE || 'development',
  DEFAULT_ITEMS_PER_PAGE: 10,
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  MAX_FILES: 5,
};

// Real-time Configuration
export const REALTIME_CONFIG = {
  WEBSOCKET_URL: `ws://localhost:5000/ws`,
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_INTERVAL: 3000,
};

export default {
  API_CONFIG,
  AUTH_CONFIG,
  APP_CONFIG,
  UPLOAD_CONFIG,
  REALTIME_CONFIG,
};
