
const express = require('express');
const multer = require('multer');
const fileController = require('../controllers/fileController');
const { authenticateToken } = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    files: 10 // Maximum 10 files per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'jpeg,jpg,png,gif,pdf,doc,docx,txt').split(',');
    const fileExt = file.originalname.split('.').pop().toLowerCase();
    
    // Security: Block dangerous file types
    const dangerousTypes = ['exe', 'bat', 'cmd', 'scr', 'pif', 'com', 'js', 'jar'];
    if (dangerousTypes.includes(fileExt)) {
      return cb(new Error(`File type '${fileExt}' is not allowed for security reasons`), false);
    }
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`File type '${fileExt}' not allowed`), false);
    }
  }
});

// Upload single file
router.post('/upload/single',
  authenticateToken,
  upload.single('file'),
  ValidationMiddleware.validateFileUpload(),
  ValidationMiddleware.handleValidationErrors,
  fileController.uploadSingle
);

// Upload multiple files
router.post('/upload/multiple',
  authenticateToken,
  upload.array('files', 10),
  ValidationMiddleware.validateFileUpload(),
  ValidationMiddleware.handleValidationErrors,
  fileController.uploadMultiple
);

// Get file (generates presigned URL for S3 or serves local file)
router.get('/:fileId',
  authenticateToken,
  fileController.getFile
);

// Delete file
router.delete('/:category/:filename',
  authenticateToken,
  fileController.deleteFile
);

// Get file info
router.get('/info/:category/:filename',
  authenticateToken,
  fileController.getFileInfo
);

// Get user's files
router.get('/user/files',
  authenticateToken,
  fileController.getUserFiles
);

// Storage health check
router.get('/system/health',
  authenticateToken,
  fileController.checkStorageHealth
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'File too large'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        success: false,
        error: 'Too many files'
      });
    }
  }
  
  if (error.message.includes('File type') || error.message.includes('not allowed')) {
    return res.status(415).json({
      success: false,
      error: error.message
    });
  }
  
  next(error);
});

module.exports = router;
