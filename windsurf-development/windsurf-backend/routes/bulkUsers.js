
const express = require('express');
const router = express.Router();
const bulkUserController = require('../controllers/bulkUserController');
const auth = require('../middleware/auth');

// Bulk create users
router.post('/create', auth, bulkUserController.bulkCreateUsers);

// Validate bulk users data
router.post('/validate', auth, bulkUserController.validateBulkUsers);

module.exports = router;
