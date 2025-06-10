
const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middlewares/auth');

// All routes require authentication
router.use(authMiddleware.authenticate);

// Upload single file
router.post('/upload', fileController.constructor.uploadSingle('file'), fileController.uploadFile);

// Upload multiple files
router.post('/upload-multiple', fileController.constructor.uploadMultiple('files', 5), fileController.uploadMultipleFiles);

// Download file (public access for authenticated users)
router.get('/download/:filename', fileController.downloadFile);

// Delete file (admin/manager only)
router.delete('/:filename', authMiddleware.authorize(['admin', 'manager']), fileController.deleteFile);

module.exports = router;
