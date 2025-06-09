
const express = require('express');
const { pool } = require('../../config/database');
const webSocketService = require('../../services/webSocketService');

const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {}
  };

  try {
    // Test database connection
    const startTime = Date.now();
    await pool.execute('SELECT 1 as test');
    const dbResponseTime = Date.now() - startTime;
    
    healthData.services.database = {
      status: 'connected',
      responseTime: `${dbResponseTime}ms`
    };
  } catch (error) {
    healthData.services.database = {
      status: 'error',
      error: error.message
    };
    healthData.status = 'degraded';
  }

  // WebSocket service status
  try {
    const connectedUsers = webSocketService.getConnectionCount();
    healthData.services.websocket = {
      status: 'running',
      connectedUsers
    };
  } catch (error) {
    healthData.services.websocket = {
      status: 'error',
      error: error.message
    };
  }

  // Email service status
  healthData.services.email = {
    status: process.env.SMTP_HOST ? 'configured' : 'not_configured'
  };

  // File upload service status
  healthData.services.fileUpload = {
    status: process.env.AWS_ACCESS_KEY_ID ? 'configured' : 'not_configured'
  };

  // Memory usage
  const memUsage = process.memoryUsage();
  healthData.memory = {
    rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
    external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
  };

  const statusCode = healthData.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthData);
});

// Detailed health check with database metrics
router.get('/detailed', async (req, res) => {
  try {
    const [issueStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_issues,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_issues,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_issues,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) as issues_last_24h
      FROM issues
    `);

    const [userStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_employees,
        COUNT(DISTINCT city) as cities,
        COUNT(DISTINCT cluster) as clusters
      FROM employees
    `);

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      statistics: {
        issues: issueStats[0],
        users: userStats[0],
        websocket: {
          connectedUsers: webSocketService.getConnectionCount()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

module.exports = router;
