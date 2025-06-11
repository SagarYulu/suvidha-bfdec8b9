
const express = require('express');
const router = express.Router();
const { multiple, handleUploadError } = require('../middlewares/upload');
const { authenticateToken, requireRole } = require('../middlewares/auth');
const BulkUploadService = require('../services/bulkUploadService');
const path = require('path');
const fs = require('fs');

// All routes require authentication
router.use(authenticateToken);

// File upload endpoints
router.post('/single', multiple, handleUploadError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select at least one file to upload'
      });
    }
    
    const fileUrls = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${file.filename}`
    }));
    
    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: fileUrls
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'An error occurred during file upload'
    });
  }
});

// Bulk upload employees
router.post('/bulk/employees', 
  requireRole(['admin', 'manager']), 
  multiple, 
  handleUploadError, 
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: 'No file uploaded',
          message: 'Please upload a CSV file'
        });
      }
      
      const file = req.files[0];
      if (!file.originalname.endsWith('.csv')) {
        return res.status(400).json({
          error: 'Invalid file type',
          message: 'Please upload a CSV file'
        });
      }
      
      const results = await BulkUploadService.processEmployeeBulkUpload(
        file.path, 
        req.user.id
      );
      
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      
      res.status(200).json({
        success: true,
        message: 'Bulk upload completed',
        data: results
      });
    } catch (error) {
      console.error('Bulk upload error:', error);
      res.status(500).json({
        error: 'Bulk upload failed',
        message: error.message
      });
    }
  }
);

// Bulk upload issues
router.post('/bulk/issues', 
  requireRole(['admin', 'manager', 'agent']), 
  multiple, 
  handleUploadError, 
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: 'No file uploaded',
          message: 'Please upload a CSV file'
        });
      }
      
      const file = req.files[0];
      if (!file.originalname.endsWith('.csv')) {
        return res.status(400).json({
          error: 'Invalid file type',
          message: 'Please upload a CSV file'
        });
      }
      
      const results = await BulkUploadService.processIssuesBulkUpload(
        file.path, 
        req.user.id
      );
      
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      
      res.status(200).json({
        success: true,
        message: 'Bulk upload completed',
        data: results
      });
    } catch (error) {
      console.error('Bulk upload error:', error);
      res.status(500).json({
        error: 'Bulk upload failed',
        message: error.message
      });
    }
  }
);

// Get bulk upload history
router.get('/bulk/history', async (req, res) => {
  try {
    const history = await BulkUploadService.getBulkUploadHistory(req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Bulk upload history retrieved',
      data: history
    });
  } catch (error) {
    console.error('Error getting upload history:', error);
    res.status(500).json({
      error: 'Failed to get upload history',
      message: error.message
    });
  }
});

// Serve uploaded files
router.get('/files/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'File not found',
        message: 'The requested file does not exist'
      });
    }
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({
      error: 'File serve error',
      message: 'An error occurred while serving the file'
    });
  }
});

module.exports = router;
