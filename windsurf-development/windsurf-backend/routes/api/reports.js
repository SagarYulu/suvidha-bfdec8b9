
const express = require('express');
const router = express.Router();
const reportsController = require('../../controllers/reportsController');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { query } = require('express-validator');

// Validation middleware
const validateDateRange = [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('city').optional().isLength({ min: 1, max: 100 }).withMessage('Invalid city'),
  query('cluster').optional().isLength({ min: 1, max: 100 }).withMessage('Invalid cluster')
];

const validateTATReport = [
  ...validateDateRange,
  query('groupBy').optional().isIn(['city', 'cluster']).withMessage('groupBy must be city or cluster')
];

const validateTrendReport = [
  query('period').optional().isIn(['7d', '30d', '90d']).withMessage('Invalid period'),
  query('city').optional().isLength({ min: 1, max: 100 }).withMessage('Invalid city'),
  query('cluster').optional().isLength({ min: 1, max: 100 }).withMessage('Invalid cluster')
];

// Routes
router.get('/tat', 
  authenticateToken, 
  requireRole(['admin', 'manager']), 
  validateTATReport, 
  reportsController.getTATReport
);

router.get('/sla', 
  authenticateToken, 
  requireRole(['admin', 'manager']), 
  validateDateRange, 
  reportsController.getSLAReport
);

router.get('/trends', 
  authenticateToken, 
  requireRole(['admin', 'manager']), 
  validateTrendReport, 
  reportsController.getTrendReport
);

router.get('/performance', 
  authenticateToken, 
  requireRole(['admin', 'manager']), 
  validateDateRange, 
  reportsController.getPerformanceReport
);

module.exports = router;
