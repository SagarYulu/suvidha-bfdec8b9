
const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { param, query } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// File upload routes

// Upload single file
router.post('/upload',
  authenticateToken,
  fileController.handleSingleUpload('file'),
  fileController.uploadSingle
);

// Upload multiple files
router.post('/upload/multiple',
  authenticateToken,
  fileController.handleMultipleUpload('files', 5),
  fileController.uploadMultiple
);

// Get signed URL for file access
router.get('/signed-url/:fileKey',
  authenticateToken,
  param('fileKey').notEmpty().withMessage('File key is required'),
  query('expires').optional().isInt({ min: 60, max: 86400 }).withMessage('Expires must be between 60 and 86400 seconds'),
  handleValidationErrors,
  fileController.getSignedUrl
);

// Get file information
router.get('/info/:fileKey',
  authenticateToken,
  param('fileKey').notEmpty().withMessage('File key is required'),
  handleValidationErrors,
  fileController.getFileInfo
);

// Delete file
router.delete('/:fileKey',
  authenticateToken,
  param('fileKey').notEmpty().withMessage('File key is required'),
  handleValidationErrors,
  fileController.deleteFile
);

// Get upload statistics (admin only)
router.get('/stats/uploads',
  authenticateToken,
  requireRole(['admin']),
  fileController.getUploadStats
);

// Cleanup old files (admin only)
router.post('/cleanup',
  authenticateToken,
  requireRole(['admin']),
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
  handleValidationErrors,
  fileController.cleanupOldFiles
);

module.exports = router;
