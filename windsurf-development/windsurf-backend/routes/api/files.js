
const express = require('express');
const router = express.Router();
const fileController = require('../../controllers/fileController');
const { authenticateToken } = require('../../middleware/auth');
const { body, param } = require('express-validator');

// Validation middleware
const validatePresignedUrl = [
  body('fileName').isLength({ min: 1, max: 255 }).withMessage('File name is required'),
  body('fileType').isLength({ min: 1 }).withMessage('File type is required'),
  body('issueId').optional().isUUID().withMessage('Invalid issue ID')
];

const validateUploadComplete = [
  body('fileId').isUUID().withMessage('Invalid file ID'),
  body('fileSize').isInt({ min: 0 }).withMessage('File size must be a positive number')
];

// Routes
router.post('/presign', 
  authenticateToken, 
  validatePresignedUrl, 
  fileController.generatePresignedUrl
);

router.post('/complete', 
  authenticateToken, 
  validateUploadComplete, 
  fileController.uploadComplete
);

router.get('/issue/:issueId', 
  authenticateToken, 
  param('issueId').isUUID(), 
  fileController.getFilesByIssue
);

router.delete('/:fileId', 
  authenticateToken, 
  param('fileId').isUUID(), 
  fileController.deleteFile
);

router.get('/download/:fileId', 
  authenticateToken, 
  param('fileId').isUUID(), 
  fileController.downloadFile
);

module.exports = router;
