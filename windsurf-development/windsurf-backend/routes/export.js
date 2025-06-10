
const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const auth = require('../middleware/auth');

// Export issues
router.get('/issues', auth, exportController.exportIssues);

// Export users
router.get('/users', auth, exportController.exportUsers);

module.exports = router;
