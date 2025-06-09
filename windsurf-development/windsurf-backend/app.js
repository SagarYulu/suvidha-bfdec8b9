
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

const config = require('./config/env');
const cronService = require('./services/cronService');
const webSocketService = require('./services/webSocketService');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const issueRoutes = require('./routes/issues');
const analyticsRoutes = require('./routes/analytics');
const feedbackRoutes = require('./routes/feedback');
const escalationRoutes = require('./routes/escalations');
const fileRoutes = require('./routes/files');
const realtimeRoutes = require('./routes/realtime');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { successResponse } = require('./utils/responseHelper');

const app = express();

// Security middleware
if (config.security.helmetEnabled) {
  app.use(helmet());
}

// CORS middleware
app.use(cors(config.cors));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  skipSuccessfulRequests: config.rateLimit.skipSuccessfulRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Logging middleware
app.use(morgan(config.logging.format));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads (if not using S3)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoints
app.get('/health', (req, res) => {
  successResponse(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv
  }, 'Service is healthy');
});

app.get('/health/detailed', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    memory: process.memoryUsage(),
    version: process.version,
    platform: process.platform,
    services: {
      database: 'healthy', // Would check actual DB connection
      email: config.smtp.host ? 'configured' : 'not_configured',
      file_storage: config.aws.accessKeyId ? 's3_configured' : 'local_storage',
      websocket: config.websocket.enabled ? 'enabled' : 'disabled',
      notifications: config.notifications.emailEnabled ? 'enabled' : 'disabled'
    },
    last_health_check: global.lastHealthCheck || null
  };

  successResponse(res, healthData, 'Detailed health information');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/escalations', escalationRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/realtime', realtimeRoutes);

// Serve frontend in production
if (config.nodeEnv === 'production') {
  app.use(express.static(path.join(__dirname, '../windsurf-frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../windsurf-frontend/dist/index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handling middleware
app.use(errorHandler);

// Initialize services when the app starts
const initializeServices = () => {
  try {
    // Initialize cron jobs
    cronService.init();
    console.log('✅ Cron service initialized');

    // Initialize other services here if needed
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing services:', error);
  }
};

// Initialize WebSocket when server starts
const initializeWebSocket = (server) => {
  if (config.websocket.enabled) {
    try {
      webSocketService.init(server);
      console.log('✅ WebSocket service initialized');
    } catch (error) {
      console.error('❌ Error initializing WebSocket:', error);
    }
  }
};

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    // Stop cron jobs
    cronService.stopAll();
    console.log('✅ Cron jobs stopped');

    // Close database connections
    const db = require('./config/database');
    if (db && db.end) {
      db.end();
      console.log('✅ Database connections closed');
    }

    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Register graceful shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Export app and initialization functions
module.exports = app;
module.exports.initializeServices = initializeServices;
module.exports.initializeWebSocket = initializeWebSocket;
