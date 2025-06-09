const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// Import route modules
const issueRoutes = require('./routes/api/issues');
const analyticsRoutes = require('./routes/api/analytics');
const uploadRoutes = require('./routes/api/upload');
const escalationRoutes = require('./routes/api/escalations');
const reportsRoutes = require('./routes/api/reports');
const notificationRoutes = require('./routes/api/notifications');
const feedbackRoutes = require('./routes/api/feedback');
const authRoutes = require('./routes/api/auth');
const filesRoutes = require('./routes/api/files');

// Import services
const cronService = require('./services/cronService');
const realTimeService = require('./services/realTimeService');
const autoAssignService = require('./services/autoAssignService');

const app = express();

// Security middleware
app.use(helmet({
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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Compression and parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const { pool } = require('./config/database');
    
    // Check database connection
    await pool.execute('SELECT 1');
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };

    // Get cron job status
    const cronStatus = cronService.getJobStatus();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: memUsageMB,
      database: 'connected',
      cronJobs: cronStatus,
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/issues', issueRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/escalations', escalationRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/files', filesRoutes);

// Auto-assignment middleware for new issues
app.use('/api/issues', async (req, res, next) => {
  if (req.method === 'POST' && req.path === '/') {
    // Hook into issue creation for auto-assignment
    const originalSend = res.send;
    res.send = function(data) {
      if (res.statusCode === 201) {
        try {
          const responseData = JSON.parse(data);
          if (responseData.success && responseData.data?.id) {
            // Trigger auto-assignment asynchronously
            setImmediate(async () => {
              try {
                await autoAssignService.autoAssignIssue(responseData.data.id);
              } catch (error) {
                console.error('Auto-assignment failed:', error);
              }
            });
          }
        } catch (error) {
          console.error('Auto-assignment hook error:', error);
        }
      }
      originalSend.call(this, data);
    };
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON payload'
    });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large'
    });
  }

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  
  // Stop cron jobs
  cronService.stopAllJobs();
  
  // Close real-time connections
  realTimeService.closeAllConnections();
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start cron jobs when server starts
if (process.env.NODE_ENV !== 'test') {
  cronService.startAllJobs();
  console.log('✅ Cron jobs started');
}

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});

// Initialize WebSocket server for real-time features
realTimeService.initialize(server);

module.exports = app;
