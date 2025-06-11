
const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const issueRoutes = require('./issueRoutes');
const employeeRoutes = require('./employeeRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const uploadRoutes = require('./uploadRoutes');
const mobileRoutes = require('./mobileRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/issues', issueRoutes);
router.use('/employees', employeeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/upload', uploadRoutes);
router.use('/mobile', mobileRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    features: {
      auth: true,
      issues: true,
      employees: true,
      dashboard: true,
      upload: true,
      mobile: true,
      websocket: true
    }
  });
});

module.exports = router;
