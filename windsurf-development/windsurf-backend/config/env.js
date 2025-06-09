
require('dotenv').config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'grievance_user',
    password: process.env.DB_PASSWORD || 'grievance_password',
    database: process.env.DB_NAME || 'grievance_portal',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000,
    timeout: parseInt(process.env.DB_TIMEOUT) || 60000
  },

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  },

  // SMTP configuration for email notifications
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true' || false,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@example.com'
  },

  // AWS S3 configuration for file uploads
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    bucketName: process.env.S3_BUCKET_NAME || 'grievance-portal-files'
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true' || false
  },

  // File upload limits
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    maxFiles: parseInt(process.env.MAX_FILES) || 5,
    allowedTypes: process.env.ALLOWED_FILE_TYPES ? 
      process.env.ALLOWED_FILE_TYPES.split(',') : 
      ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword'],
    uploadDir: process.env.UPLOAD_DIR || './uploads'
  },

  // TAT (Turn Around Time) configuration
  tat: {
    warningHours: parseInt(process.env.TAT_WARNING_HOURS) || 24 * 7, // 7 days
    criticalHours: parseInt(process.env.TAT_CRITICAL_HOURS) || 24 * 14, // 14 days
    breachHours: parseInt(process.env.TAT_BREACH_HOURS) || 24 * 30 // 30 days
  },

  // Notification settings
  notifications: {
    emailEnabled: process.env.EMAIL_NOTIFICATIONS === 'true' || true,
    smsEnabled: process.env.SMS_NOTIFICATIONS === 'true' || false,
    pushEnabled: process.env.PUSH_NOTIFICATIONS === 'true' || true,
    realtimeEnabled: process.env.REALTIME_NOTIFICATIONS === 'true' || true
  },

  // WebSocket configuration
  websocket: {
    enabled: process.env.WEBSOCKET_ENABLED === 'true' || true,
    path: process.env.WEBSOCKET_PATH || '/ws',
    pingInterval: parseInt(process.env.WEBSOCKET_PING_INTERVAL) || 30000,
    pongTimeout: parseInt(process.env.WEBSOCKET_PONG_TIMEOUT) || 5000
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    filename: process.env.LOG_FILENAME || './logs/app.log',
    maxsize: parseInt(process.env.LOG_MAX_SIZE) || 5242880, // 5MB
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5
  },

  // Security settings
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
    csrfEnabled: process.env.CSRF_ENABLED === 'true' || false,
    helmetEnabled: process.env.HELMET_ENABLED === 'true' || true
  },

  // Cache configuration (if using Redis)
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true' || false,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB) || 0,
    ttl: parseInt(process.env.CACHE_TTL) || 3600 // 1 hour
  },

  // Health check settings
  health: {
    enabled: process.env.HEALTH_CHECK_ENABLED === 'true' || true,
    endpoint: process.env.HEALTH_CHECK_ENDPOINT || '/health',
    detailedEndpoint: process.env.DETAILED_HEALTH_ENDPOINT || '/health/detailed'
  },

  // Monitoring and metrics
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true' || false,
    metricsEndpoint: process.env.METRICS_ENDPOINT || '/metrics',
    prometheusEnabled: process.env.PROMETHEUS_ENABLED === 'true' || false
  },

  // Backup configuration
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true' || false,
    schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30,
    destination: process.env.BACKUP_DESTINATION || './backups'
  }
};
