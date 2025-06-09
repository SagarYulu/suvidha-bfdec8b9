
export const APP_CONFIG = {
  NAME: 'Windsurf Portal',
  VERSION: '1.0.0',
  ENVIRONMENT: import.meta.env.MODE || 'development',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // File upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  MAX_FILES_PER_UPLOAD: 5,
  
  // Auth
  TOKEN_STORAGE_KEY: 'authToken',
  USER_STORAGE_KEY: 'user',
  
  // Real-time
  WEBSOCKET_URL: `ws://localhost:5000/ws`,
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_INTERVAL: 3000,
};

export default APP_CONFIG;
