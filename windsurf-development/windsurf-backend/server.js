
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const realTimeService = require('./services/realTimeService');
const emailService = require('./services/emailService');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/users');
const issueRoutes = require('./routes/issueRoutes');
const uploadRoutes = require('./routes/upload');
const dashboardRoutes = require('./routes/dashboard');
const feedbackRoutes = require('./routes/feedbackRoutes');
const analyticsRoutes = require('./routes/analytics');
const rbacRoutes = require('./routes/rbac');
const healthRoutes = require('./routes/health');
const realTimeRoutes = require('./routes/realtime');

const { requestLogger, errorHandler } = require('./middleware/errorHandler');
require('dotenv').config();

// Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize real-time service with WebSocket support
realTimeService.initializeWebSocketServer(server);
realTimeService.startHeartbeat();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware setup
app.use(limiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-info', 'apikey']
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/rbac', rbacRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/realtime', realTimeRoutes);

// Global error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server available at ws://localhost:${PORT}/realtime`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
  console.log(`📊 Health check at http://localhost:${PORT}/health`);
  
  // Test email service configuration
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    console.log('📧 Email service configured');
  } else {
    console.log('⚠️  Email service not configured - check SMTP settings in .env');
  }
  
  // Test real-time service
  if (process.env.REALTIME_ENABLED === 'true') {
    console.log('⚡ Real-time service enabled');
  } else {
    console.log('⚠️  Real-time service disabled');
  }
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 ${signal} received, shutting down gracefully...`);
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    
    // Close WebSocket connections
    realTimeService.shutdown();
    console.log('✅ WebSocket server closed');
    
    // Close database connections if any
    // db.end() if using connection pool
    
    console.log('✅ Graceful shutdown complete');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in production
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  // Exit the process as the application is in an unknown state
  process.exit(1);
});

module.exports = app;
