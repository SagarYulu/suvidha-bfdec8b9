
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middlewares/auth');
const BulkUploadService = require('../services/bulkUploadService');
const { HTTP_STATUS } = require('../config/constants');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/files/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'text/csv', 'application/vnd.ms-excel'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// All routes require authentication
router.use(authenticateToken);

// Single file upload
router.post('/single', upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const uploadResults = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/files/${file.filename}`
    }));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Files uploaded successfully',
      data: uploadResults
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'File upload failed',
      message: error.message
    });
  }
});

// Bulk upload employees
router.post('/bulk/employees', upload.single('files'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const result = await BulkUploadService.uploadEmployees(req.file.path, req.user.id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Bulk upload completed',
      data: result
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Bulk upload failed',
      message: error.message
    });
  }
});

// Bulk upload issues
router.post('/bulk/issues', upload.single('files'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const result = await BulkUploadService.uploadIssues(req.file.path, req.user.id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Bulk upload completed',
      data: result
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Bulk upload failed',
      message: error.message
    });
  }
});

// Get bulk upload history
router.get('/bulk/history', async (req, res) => {
  try {
    const history = await BulkUploadService.getUploadHistory(req.user.id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Upload history retrieved',
      data: history
    });
  } catch (error) {
    console.error('Get upload history error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to get upload history',
      message: error.message
    });
  }
});

module.exports = router;
