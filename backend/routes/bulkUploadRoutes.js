
const express = require('express');
const router = express.Router();
const multer = require('multer');
const bulkUploadController = require('../controllers/bulkUploadController');
const authMiddleware = require('../middlewares/auth');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// All routes require authentication
router.use(authMiddleware.authenticate);

// Dashboard users bulk upload
router.post('/dashboard-users/process', 
  authMiddleware.authorize(['admin', 'super_admin']),
  upload.single('csv'),
  bulkUploadController.uploadDashboardUsers
);

router.post('/dashboard-users/commit',
  authMiddleware.authorize(['admin', 'super_admin']),
  bulkUploadController.commitDashboardUsers
);

// Employees bulk upload
router.post('/employees/process',
  authMiddleware.authorize(['admin', 'super_admin', 'hr_admin']),
  upload.single('csv'),
  bulkUploadController.uploadEmployees
);

router.post('/employees/commit',
  authMiddleware.authorize(['admin', 'super_admin', 'hr_admin']),
  bulkUploadController.commitEmployees
);

// CSV templates
router.get('/template/:type',
  authMiddleware.authorize(['admin', 'super_admin', 'hr_admin']),
  bulkUploadController.getCSVTemplate
);

module.exports = router;
