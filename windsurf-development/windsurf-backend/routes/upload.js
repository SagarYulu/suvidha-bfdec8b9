
const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
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
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`File type '${fileExt}' not allowed`), false);
    }
  }
});

// Upload single file
router.post('/single',
  authenticateToken,
  upload.single('file'),
  ValidationMiddleware.validateFileUpload(),
  ValidationMiddleware.handleValidationErrors,
  uploadController.uploadSingleFile
);

// Upload multiple files
router.post('/multiple',
  authenticateToken,
  upload.array('files', 10),
  ValidationMiddleware.validateFileUpload(),
  ValidationMiddleware.handleValidationErrors,
  uploadController.uploadMultipleFiles
);

// Delete file
router.delete('/:category/:filename',
  authenticateToken,
  uploadController.deleteFile
);

// Get file info
router.get('/:category/:filename',
  authenticateToken,
  uploadController.getFile
);

// Get user's files
router.get('/user/files',
  authenticateToken,
  uploadController.getUserFiles
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
  
  if (error.message.includes('File type')) {
    return res.status(415).json({
      success: false,
      error: error.message
    });
  }
  
  next(error);
});

module.exports = router;
