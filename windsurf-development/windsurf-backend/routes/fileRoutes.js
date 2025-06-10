
const express = require('express');
const multer = require('multer');
const fileController = require('../controllers/fileController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
                         'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  }
});

// Upload single file
router.post('/upload',
  authenticateToken,
  upload.single('file'),
  fileController.uploadSingle
);

// Upload multiple files
router.post('/upload-multiple',
  authenticateToken,
  upload.array('files', 5),
  fileController.uploadMultiple
);

// Get file (with presigned URL)
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
router.get('/health/storage',
  authenticateToken,
  fileController.checkStorageHealth
);

module.exports = router;
