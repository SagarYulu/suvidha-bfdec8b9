
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticateToken);

// Analytics routes
router.get('/dashboard', 
  requireRole(['admin', 'manager', 'agent']), 
  analyticsController.getDashboardAnalytics
);

router.get('/sla-metrics', 
  requireRole(['admin', 'manager']), 
  analyticsController.getSLAMetrics
);

router.get('/trends', 
  requireRole(['admin', 'manager']), 
  analyticsController.getTrendAnalysis
);

router.get('/performance', 
  requireRole(['admin', 'manager']), 
  analyticsController.getPerformanceMetrics
);

module.exports = router;
