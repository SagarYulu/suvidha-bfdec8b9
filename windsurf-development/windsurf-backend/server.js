
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
const slaService = require('./services/slaService');

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
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'connected',
      webSocket: 'running',
      email: 'configured'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', authMiddleware.authenticateToken, issueRoutes);
app.use('/api/feedback', authMiddleware.authenticateToken, feedbackRoutes);
app.use('/api/upload', authMiddleware.authenticateToken, uploadRoutes);
app.use('/api/files', fileRoutes); // File routes with built-in auth
app.use('/api/analytics', authMiddleware.authenticateToken, analyticsRoutes);

// Serve static files for uploads
app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'uploads'));

// WebSocket setup for real-time functionality
const wss = new WebSocket.Server({ 
  server,
  path: '/realtime'
});

// Initialize real-time service
realTimeService.initialize(wss);

// SLA Monitoring - Check every hour
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Running scheduled SLA breach check...');
    const result = await slaService.checkSLABreaches();
    console.log(`SLA check completed: ${result.checked} issues checked, ${result.breached} breaches found`);
  } catch (error) {
    console.error('Scheduled SLA check failed:', error);
  }
});

// Additional cron jobs
// Clean up old audit logs (monthly)
cron.schedule('0 0 1 * *', async () => {
  try {
    console.log('Running monthly cleanup...');
    // Add cleanup logic here if needed
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

  // Close WebSocket server
  if (wss) {
    console.log('Closing WebSocket server...');
    wss.close(() => {
      console.log('WebSocket server closed');
    });
  }

  // Stop cron jobs
  cron.destroy();

  // Close HTTP server
  server.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('HTTP server closed');
    
    // Close database connections if needed
    // db.end() if using connection pool
    
    console.log('Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}/realtime`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log('SLA monitoring: Enabled (hourly checks)');
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`Frontend CORS allowed from: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  }
});

module.exports = { app, server, wss };
