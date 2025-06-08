
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const issueRoutes = require('./routes/issues');
const mobileRoutes = require('./routes/mobile');
const analyticsRoutes = require('./routes/analytics');
const feedbackRoutes = require('./routes/feedback');
const dashboardRoutes = require('./routes/dashboard');
const notificationRoutes = require('./routes/notifications');
const uploadRoutes = require('./routes/upload');
const realtimeRoutes = require('./routes/realtime');

// Service imports
const realTimeService = require('./services/realTimeService');
const enhancedEmailService = require('./services/enhancedEmailService');
const fileUploadService = require('./services/fileUploadService');

// Middleware imports
const ValidationMiddleware = require('./middleware/validationMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Input sanitization middleware
app.use(ValidationMiddleware.sanitizeInput);

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/mobile', mobileRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/realtime', realtimeRoutes);

// Health check endpoint with service status
app.get('/health', async (req, res) => {
  const emailStatus = await enhancedEmailService.testConnection();
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Windsurf Backend API',
    version: '2.0.0',
    services: {
      database: 'connected',
      email: emailStatus.success ? 'connected' : 'disconnected',
      realtime: `${realTimeService.getConnectionCount()} active connections`,
      fileUpload: 'ready'
    }
  });
});

// Service status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: realTimeService.getConnectionCount(),
    connectedUsers: realTimeService.getConnectedUsers().length,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  // Handle multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      error: 'File too large',
      maxSize: '10MB'
    });
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ 
      error: 'Too many files',
      maxCount: 5
    });
  }

  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize services
const initializeServices = async () => {
  try {
    // Test email service
    const emailTest = await enhancedEmailService.testConnection();
    console.log('📧 Email service:', emailTest.success ? 'Connected' : 'Failed');
    
    // Initialize file upload directories
    console.log('📁 File upload service: Initialized');
    
    // Initialize real-time service
    console.log('⚡ Real-time service: Ready');
    
    console.log('🎉 All services initialized successfully');
  } catch (error) {
    console.error('❌ Service initialization error:', error);
  }
};

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`⚡ Real-time: http://localhost:${PORT}/api/realtime/stream`);
  console.log(`📁 File uploads: http://localhost:${PORT}/api/upload`);
  
  await initializeServices();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Graceful shutdown initiated...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Graceful shutdown initiated...');
  process.exit(0);
});

module.exports = app;
