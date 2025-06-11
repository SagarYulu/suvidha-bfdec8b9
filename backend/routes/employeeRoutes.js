
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { validationRules, handleValidationErrors } = require('../middlewares/validation');

// All routes require authentication
router.use(authenticateToken);

// Employee CRUD operations
router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', 
  requireRole(['admin', 'manager']),
  validationRules.createEmployee,
  handleValidationErrors,
  employeeController.createEmployee
);
router.put('/:id', 
  requireRole(['admin', 'manager']),
  employeeController.updateEmployee
);
router.delete('/:id', 
  requireRole(['admin']),
  employeeController.deleteEmployee
);

// Bulk operations
router.post('/bulk-upload', 
  requireRole(['admin', 'manager']),
  employeeController.bulkUpload
);

module.exports = router;
