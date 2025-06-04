const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const issueRoutes = require('./routes/issues');
const analyticsRoutes = require('./routes/analytics');
const feedbackRoutes = require('./routes/feedback');
const exportRoutes = require('./routes/export');
const notificationRoutes = require('./routes/notifications');
const standaloneRoutes = require('./routes/standalone');
const rbacRoutes = require('./routes/rbac');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/users', require('./routes/users'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/export', require('./routes/export'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/rbac', require('./routes/rbac'));
app.use('/api/standalone', require('./routes/standalone'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mode: 'standalone'
  });
});

// Default route with status
app.get('/', (req, res) => {
  res.json({
    message: 'Windsurf Backend API - Standalone Mode',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      standalone: '/api/standalone',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Mode: Standalone (No external dependencies)');
});

module.exports = app;
