
const uploadService = require('../services/uploadService');
const { validationResult } = require('express-validator');

class UploadController {
  async uploadSingleFile(req, res) {
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

      const { category = 'attachments' } = req.body;
      const result = await uploadService.uploadFile(req.file, category, req.user.id);

      res.json({
        success: true,
        file: result,
        message: 'File uploaded successfully'
      });
    } catch (error) {
      console.error('Single file upload error:', error);
      res.status(500).json({
        success: false,
        error: 'File upload failed'
      });
    }
  }

  async uploadMultipleFiles(req, res) {
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

      const { category = 'attachments' } = req.body;
      const results = await uploadService.uploadMultipleFiles(req.files, category, req.user.id);

      res.json({
        success: true,
        files: results,
        message: `${results.length} files uploaded successfully`
      });
    } catch (error) {
      console.error('Multiple file upload error:', error);
      res.status(500).json({
        success: false,
        error: 'File upload failed'
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
        error: 'File deletion failed'
      });
    }
  }

  async getFile(req, res) {
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
      console.error('Get file error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get file info'
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
        error: 'Failed to get user files'
      });
    }
  }
}

module.exports = new UploadController();
