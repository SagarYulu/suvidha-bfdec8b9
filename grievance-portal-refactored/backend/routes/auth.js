
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('role').optional().isIn(['employee', 'admin', 'support'])
], authController.register);

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], authController.login);

// Verify token
router.get('/verify', authenticateToken, authController.verify);

// Employee login (using employee ID)
router.post('/employee/login', [
  body('employeeId').notEmpty().trim(),
  body('password').notEmpty()
], authController.employeeLogin);

module.exports = router;
