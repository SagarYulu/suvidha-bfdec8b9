
const fileUploadService = require('../services/fileUploadService');
const { validationResult } = require('express-validator');

class FileController {
  async generatePresignedUrl(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { fileName, fileType, issueId } = req.body;
      const userId = req.user.id;

      const result = await fileUploadService.generatePresignedUrl(
        fileName, 
        fileType, 
        userId, 
        issueId
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Presigned URL generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate upload URL'
      });
    }
  }

  async uploadComplete(req, res) {
    try {
      const { fileId, fileSize } = req.body;
      
      await fileUploadService.uploadComplete(fileId, fileSize);

      res.json({
        success: true,
        message: 'Upload completed successfully'
      });
    } catch (error) {
      console.error('Upload completion error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to complete upload'
      });
    }
  }

  async getFilesByIssue(req, res) {
    try {
      const { issueId } = req.params;
      
      const files = await fileUploadService.getFilesByIssue(issueId);

      res.json({
        success: true,
        data: files
      });
    } catch (error) {
      console.error('Get files error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch files'
      });
    }
  }

  async deleteFile(req, res) {
    try {
      const { fileId } = req.params;
      const userId = req.user.id;
      
      await fileUploadService.deleteFile(fileId, userId);

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('File deletion error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete file'
      });
    }
  }

  async downloadFile(req, res) {
    try {
      const { fileId } = req.params;
      const userId = req.user.id;
      
      const downloadUrl = await fileUploadService.generateDownloadUrl(fileId, userId);

      res.json({
        success: true,
        downloadUrl
      });
    } catch (error) {
      console.error('File download error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate download URL'
      });
    }
  }
}

module.exports = new FileController();
