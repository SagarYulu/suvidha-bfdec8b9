
const express = require('express');
const path = require('path');
const fileUploadService = require('../services/fileUploadService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Upload single file
router.post('/single', authenticateToken, (req, res) => {
  const upload = fileUploadService.getMulterConfig('attachments').single('file');
  
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUploadService.generateFileUrl(req.file.filename),
        path: req.file.path
      }
    });
  });
});

// Upload multiple files
router.post('/multiple', authenticateToken, (req, res) => {
  const upload = fileUploadService.getMulterConfig('attachments').array('files', 5);
  
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: fileUploadService.generateFileUrl(file.filename),
      path: file.path
    }));

    res.json({
      success: true,
      files
    });
  });
});

// Serve uploaded files
router.get('/:category/:filename', (req, res) => {
  const { category, filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', category, filename);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
  });
});

// Delete file
router.delete('/:category/:filename', authenticateToken, async (req, res) => {
  try {
    const { category, filename } = req.params;
    const filePath = path.join(category, filename);
    
    const deleted = await fileUploadService.deleteFile(filePath);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    });
  }
});

module.exports = router;
