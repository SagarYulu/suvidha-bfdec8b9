
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const cron = require('node-cron');
require('dotenv').config();

const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const realTimeService = require('./services/realTimeService');

// Import routes
const issueRoutes = require('./routes/issueRoutes');
const authRoutes = require('./routes/authRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const fileRoutes = require('./routes/fileRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint with comprehensive status
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'connected',
      webSocket: 'running',
      email: 'configured',
      storage: 'available'
    }
  };

  try {
    const { pool } = require('./config/database');
    await pool.execute('SELECT 1');
    health.services.database = 'connected';
  } catch (error) {
    health.services.database = 'error';
    health.status = 'DEGRADED';
  }

  try {
    health.services.webSocket = realTimeService.getConnectedClients() >= 0 ? 'running' : 'stopped';
  } catch (error) {
    health.services.webSocket = 'error';
    health.status = 'DEGRADED';
  }

  health.services.email = process.env.SMTP_HOST ? 'configured' : 'not_configured';
  health.services.storage = process.env.AWS_ACCESS_KEY_ID ? 'configured' : 'not_configured';

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', authMiddleware.authenticateToken, issueRoutes);
app.use('/api/feedback', authMiddleware.authenticateToken, feedbackRoutes);
app.use('/api/upload', authMiddleware.authenticateToken, uploadRoutes);
app.use('/api/files', authMiddleware.authenticateToken, fileRoutes);
app.use('/api/analytics', authMiddleware.authenticateToken, analyticsRoutes);

app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'uploads'));

// Initialize real-time service with WebSocket server
realTimeService.initialize(server);

// SLA Monitoring - Check every hour for breaches
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Running scheduled SLA breach check...');
    const tatService = require('./services/tatService');
    const breaches = await tatService.getSLABreaches();
    console.log(`SLA check completed: ${breaches.total} issues checked, ${breaches.breached} breaches found`);
    
    if (breaches.breached > 0) {
      console.log(`⚠️  ${breaches.breached} SLA breaches detected`);
    }
  } catch (error) {
    console.error('Scheduled SLA check failed:', error);
  }
});

// Cleanup old audit logs monthly
cron.schedule('0 0 1 * *', async () => {
  try {
    console.log('Running monthly audit log cleanup...');
    const { pool } = require('./config/database');
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 12);
    
    await pool.execute(
      'DELETE FROM issue_audit_trail WHERE created_at < ?',
      [cutoffDate]
    );
    
    await pool.execute(
      'DELETE FROM dashboard_user_audit_logs WHERE performed_at < ?',
      [cutoffDate]
    );
    
    console.log('Monthly cleanup completed');
  } catch (error) {
    console.error('Monthly cleanup failed:', error);
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;

// Graceful shutdown handling
let isShuttingDown = false;

const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  if (isShuttingDown) {
    console.log('Shutdown already in progress...');
    return;
  }
  
  isShuttingDown = true;

  try {
    realTimeService.closeAllConnections();
    console.log('WebSocket connections closed');
  } catch (error) {
    console.error('Error closing WebSocket connections:', error);
  }

  cron.destroy();

  server.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('HTTP server closed');
    
    try {
      const { pool } = require('./config/database');
      pool.end();
      console.log('Database connections closed');
    } catch (error) {
      console.error('Error closing database connections:', error);
    }
    
    console.log('Graceful shutdown completed');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 WebSocket server running on ws://localhost:${PORT}/realtime`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
  console.log(`📊 SLA monitoring: Enabled (hourly checks)`);
  console.log(`🔒 Security: Helmet, CORS, Rate limiting enabled`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎯 Frontend CORS allowed from: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`📧 Email service: ${process.env.SMTP_HOST ? 'Configured' : 'Not configured'}`);
    console.log(`☁️  AWS S3 storage: ${process.env.AWS_ACCESS_KEY_ID ? 'Configured' : 'Not configured'}`);
  }
});

module.exports = { app, server };
