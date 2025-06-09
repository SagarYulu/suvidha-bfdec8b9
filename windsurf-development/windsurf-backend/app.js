
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const { errorResponse } = require('./utils/responseHelper');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const issueRoutes = require('./routes/api/issues');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimiting.windowMs,
  max: config.rateLimiting.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use('*', (req, res) => {
  errorResponse(res, `Route ${req.originalUrl} not found`, 404);
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  if (error.type === 'entity.parse.failed') {
    return errorResponse(res, 'Invalid JSON payload', 400);
  }
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return errorResponse(res, 'File size too large', 413);
  }
  
  errorResponse(res, 'Internal server error', 500);
});

module.exports = app;
