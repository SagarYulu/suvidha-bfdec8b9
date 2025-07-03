const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  bulkCreateEmployees
} = require('../controllers/employeeController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Get all employees (protected)
router.get('/', authenticateToken, getEmployees);

// Get employee statistics (admin only)
router.get('/stats', authenticateToken, authorizeRoles('admin'), getEmployeeStats);

// Bulk create employees (admin only)
router.post('/bulk', authenticateToken, authorizeRoles('admin'), bulkCreateEmployees);

// Get employee by ID (protected)
router.get('/:id', authenticateToken, getEmployeeById);

// Create new employee (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), createEmployee);

// Update employee (admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateEmployee);

// Delete employee (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteEmployee);

module.exports = router;