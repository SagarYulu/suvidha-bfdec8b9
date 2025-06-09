
const express = require('express');
const router = express.Router();
const tatController = require('../../controllers/tatController');
const { authenticateToken } = require('../../middleware/auth');
const { query } = require('express-validator');

// Validation middleware
const validateDateRange = [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
];

// Routes
router.get('/metrics', 
  authenticateToken, 
  validateDateRange,
  tatController.getTATMetrics
);

router.get('/trend', 
  authenticateToken, 
  validateDateRange,
  tatController.getTATTrendData
);

router.get('/breaches', 
  authenticateToken, 
  tatController.getSLABreaches
);

router.get('/performance', 
  authenticateToken, 
  tatController.getTeamPerformance
);

module.exports = router;
