
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const authController = require('../controllers/authController');

const router = express.Router();

// Admin login
router.post('/admin/login', 
  validateRequest(schemas.adminLogin), 
  authController.adminLogin
);

// Employee login
router.post('/employee/login', 
  validateRequest(schemas.employeeLogin), 
  authController.employeeLogin
);

// Verify token
router.get('/verify', 
  authenticateToken, 
  authController.verifyToken
);

// Logout (optional - mainly for client-side token removal)
router.post('/logout', authController.logout);

module.exports = router;
