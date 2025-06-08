
const uploadService = require('../services/uploadService');
const { validationResult } = require('express-validator');

class FileController {
  async uploadSingle(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided'
        });
      }

      const { category = 'attachments', issueId } = req.body;
      const result = await uploadService.uploadFile(req.file, category, req.user.id, issueId);

      res.json({
        success: true,
        file: result,
        message: 'File uploaded successfully'
      });
    } catch (error) {
      console.error('Single file upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'File upload failed'
      });
    }
  }

  async uploadMultiple(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files provided'
        });
      }

      const { category = 'attachments', issueId } = req.body;
      const results = await uploadService.uploadMultipleFiles(req.files, category, req.user.id, issueId);

      res.json({
        success: true,
        files: results,
        message: `${results.length} files processed`
      });
    } catch (error) {
      console.error('Multiple file upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'File upload failed'
      });
    }
  }

  async getFile(req, res) {
    try {
      const { fileId } = req.params;
      
      const fileUrl = await uploadService.getFileUrl(fileId);
      
      if (!fileUrl) {
        return res.status(404).json({
          success: false,
          error: 'File not found'
        });
      }

      // For S3 files, redirect to presigned URL
      if (fileUrl.includes('amazonaws.com')) {
        return res.redirect(fileUrl);
      }

      // For local files, serve directly
      res.json({
        success: true,
        url: fileUrl
      });
    } catch (error) {
      console.error('Get file error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get file'
      });
    }
  }

  async deleteFile(req, res) {
    try {
      const { category, filename } = req.params;
      
      const deleted = await uploadService.deleteFile(filename, category, req.user.id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'File not found or access denied'
        });
      }

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('File deletion error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'File deletion failed'
      });
    }
  }

  async getFileInfo(req, res) {
    try {
      const { category, filename } = req.params;
      
      const fileInfo = await uploadService.getFileInfo(filename, category);
      
      if (!fileInfo) {
        return res.status(404).json({
          success: false,
          error: 'File not found'
        });
      }

      res.json({
        success: true,
        file: fileInfo
      });
    } catch (error) {
      console.error('Get file info error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get file info'
      });
    }
  }

  async getUserFiles(req, res) {
    try {
      const { category } = req.query;
      const files = await uploadService.getUserFiles(req.user.id, category);

      res.json({
        success: true,
        files
      });
    } catch (error) {
      console.error('Get user files error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get user files'
      });
    }
  }

  async checkStorageHealth(req, res) {
    try {
      const s3Status = await uploadService.checkS3Connection();
      
      res.json({
        success: true,
        storage: {
          s3: s3Status,
          local: { status: 'available', message: 'Local storage available' }
        }
      });
    } catch (error) {
      console.error('Storage health check error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Storage health check failed'
      });
    }
  }
}

module.exports = new FileController();
