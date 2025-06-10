
const express = require('express');
const authController = require('../controllers/authController');
const { body } = require('express-validator');

const router = express.Router();

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const mobileLoginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('employeeId').notEmpty().withMessage('Employee ID is required')
];

// Admin login
router.post('/login', loginValidation, authController.login);

// Mobile login
router.post('/mobile-login', mobileLoginValidation, authController.mobileLogin);

// Logout
router.post('/logout', authController.logout);

module.exports = router;
