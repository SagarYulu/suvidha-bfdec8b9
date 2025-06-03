
// Main Server File
// Express.js server setup with all the extracted logic including updated analytics

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import services
const { AuthService } = require('./auth/authService');
const { AuthContextManager } = require('./auth/authContext');
const { IssueService } = require('./issues/issueService');
const { UserService } = require('./users/userService');
const { RBACService } = require('./rbac/rbacService');
const { FeedbackService } = require('./feedback/feedbackService');
const { AnalyticsService } = require('./analytics/analyticsService');
const { ExportService } = require('./export/exportService');
const { AuthMiddleware } = require('./middleware/authMiddleware');
const { DatabaseConfig } = require('./config/database');

// Import routes
const { AuthRoutes } = require('./routes/authRoutes');
const { IssueRoutes } = require('./routes/issueRoutes');
const { AnalyticsRoutes } = require('./routes/analyticsRoutes');

class YuluSuvidhaServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.setupDatabase();
    this.setupServices();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupDatabase() {
    // Initialize database connection
    // You'll need to implement the actual database connection here
    // This is a placeholder for your database setup
    this.dbConnection = {
      query: async (sql, params) => {
        // Implement your database query logic here
        console.log('Database query:', sql, params);
        // Return mock data or implement actual database connection
        return [];
      }
    };
  }

  setupServices() {
    // Initialize services
    this.authService = new AuthService();
    this.authContextManager = new AuthContextManager();
    this.issueService = new IssueService(this.dbConnection);
    this.userService = new UserService(this.dbConnection);
    this.rbacService = new RBACService(this.dbConnection);
    this.feedbackService = new FeedbackService(this.dbConnection);
    this.analyticsService = new AnalyticsService(this.dbConnection);
    this.exportService = new ExportService(this.dbConnection, this.analyticsService);
    this.authMiddleware = new AuthMiddleware(this.authService, this.rbacService);
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    
    // CORS middleware
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    });
    this.app.use(limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Yulu Suvidha Backend'
      });
    });

    // Authentication routes
    const authRoutes = new AuthRoutes(this.authService, this.authMiddleware);
    this.app.use('/api/auth', authRoutes.setupRoutes());

    // Issue management routes
    const issueRoutes = new IssueRoutes(this.issueService, this.authMiddleware);
    this.app.use('/api/issues', issueRoutes.setupRoutes());

    // Analytics and export routes
    const analyticsRoutes = new AnalyticsRoutes(
      this.analyticsService, 
      this.exportService, 
      this.authMiddleware
    );
    this.app.use('/api/analytics', analyticsRoutes.setupRoutes());

    // User management routes
    this.app.use('/api/users', this.setupUserRoutes());

    // Feedback routes
    this.app.use('/api/feedback', this.setupFeedbackRoutes());

    // RBAC routes
    this.app.use('/api/rbac', this.setupRBACRoutes());

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl
      });
    });
  }

  setupUserRoutes() {
    const router = express.Router();

    // Get user profile
    router.get('/profile', 
      this.authMiddleware.authenticateMobile.bind(this.authMiddleware),
      async (req, res) => {
        try {
          const user = await this.userService.getUserById(req.user.id);
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
          res.json({ success: true, user });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          res.status(500).json({ error: 'Failed to fetch user profile' });
        }
      }
    );

    return router;
  }

  setupFeedbackRoutes() {
    const router = express.Router();

    // Submit feedback
    router.post('/',
      this.authMiddleware.authenticateMobile.bind(this.authMiddleware),
      async (req, res) => {
        try {
          const feedbackData = {
            ...req.body,
            employeeUuid: req.user.id
          };

          const feedbackId = await this.feedbackService.submitFeedback(feedbackData);
          
          if (!feedbackId) {
            return res.status(500).json({ error: 'Failed to submit feedback' });
          }

          res.status(201).json({
            success: true,
            feedbackId,
            message: 'Feedback submitted successfully'
          });

        } catch (error) {
          console.error('Error submitting feedback:', error);
          res.status(500).json({ error: 'Failed to submit feedback' });
        }
      }
    );

    return router;
  }

  setupRBACRoutes() {
    const router = express.Router();

    // Check user permissions
    router.get('/permissions/:userId',
      this.authMiddleware.authenticateAdmin.bind(this.authMiddleware),
      async (req, res) => {
        try {
          const { userId } = req.params;
          const permissions = await this.rbacService.getUserPermissions(userId);
          res.json({ success: true, permissions });
        } catch (error) {
          console.error('Error fetching permissions:', error);
          res.status(500).json({ error: 'Failed to fetch permissions' });
        }
      }
    );

    return router;
  }

  setupErrorHandling() {
    // Global error handler
    this.app.use((error, req, res, next) => {
      console.error('Global error handler:', error);
      
      if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON payload' });
      }

      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`✅ Yulu Suvidha Backend Server running on port ${this.port}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${this.port}/health`);
      console.log(`📈 Analytics API: http://localhost:${this.port}/api/analytics`);
      console.log(`📤 Export API: http://localhost:${this.port}/api/analytics/export`);
    });
  }
}

// Start the server
if (require.main === module) {
  const server = new YuluSuvidhaServer();
  server.start();
}

module.exports = { YuluSuvidhaServer };
