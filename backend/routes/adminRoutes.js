
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const { requireAdminAccess } = require('../middlewares/adminAuth');
const { validationRules, handleValidationErrors } = require('../middlewares/validation');

// Admin-specific authentication routes
router.post('/login', 
  validationRules.userLogin, 
  handleValidationErrors, 
  (req, res, next) => {
    // Mark this as an admin login request
    req.headers['x-admin-login'] = 'true';
    next();
  },
  authController.login
);

router.post('/logout', 
  authenticateToken, 
  authController.logout
);

// Apply admin access protection to all authenticated routes
router.use(authenticateToken);
router.use(requireAdminAccess);

// Admin-specific routes would go here
// Example: router.get('/dashboard', dashboardController.getAdminDashboard);

module.exports = router;
