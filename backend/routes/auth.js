const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  employeeLogin, 
  getProfile, 
  logout 
} = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/employee-login', employeeLogin);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);

module.exports = router;