
const FileUploadService = require('../services/fileUploadService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class FileController {
  async uploadSingle(req, res) {
    try {
      if (!req.file) {
        return errorResponse(res, 'No file provided', 400);
      }

      const folder = req.body.category || 'attachments';
      const result = await FileUploadService.uploadSingle(req.file, folder);

      successResponse(res, result, 'File uploaded successfully', 201);
    } catch (error) {
      console.error('Single file upload error:', error);
      errorResponse(res, error.message);
    }
  }

  async uploadMultiple(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return errorResponse(res, 'No files provided', 400);
      }

      const folder = req.body.category || 'attachments';
      const result = await FileUploadService.uploadMultiple(req.files, folder);

      successResponse(res, result, 'Files uploaded successfully', 201);
    } catch (error) {
      console.error('Multiple file upload error:', error);
      errorResponse(res, error.message);
    }
  }

  async deleteFile(req, res) {
    try {
      const { fileKey } = req.params;
      
      if (!fileKey) {
        return errorResponse(res, 'File key is required', 400);
      }

      await FileUploadService.deleteFile(fileKey);

      successResponse(res, null, 'File deleted successfully');
    } catch (error) {
      console.error('Delete file error:', error);
      errorResponse(res, error.message);
    }
  }

  async getSignedUrl(req, res) {
    try {
      const { fileKey } = req.params;
      const expires = parseInt(req.query.expires) || 3600; // 1 hour default

      if (!fileKey) {
        return errorResponse(res, 'File key is required', 400);
      }

      const url = await FileUploadService.getSignedUrl(fileKey, expires);

      successResponse(res, { url, expires }, 'Signed URL generated successfully');
    } catch (error) {
      console.error('Get signed URL error:', error);
      errorResponse(res, error.message);
    }
  }

  async getFileInfo(req, res) {
    try {
      const { fileKey } = req.params;

      if (!fileKey) {
        return errorResponse(res, 'File key is required', 400);
      }

      const fileInfo = await FileUploadService.getFileInfo(fileKey);

      successResponse(res, fileInfo, 'File information retrieved successfully');
    } catch (error) {
      console.error('Get file info error:', error);
      errorResponse(res, error.message);
    }
  }

  async cleanupOldFiles(req, res) {
    try {
      const daysOld = parseInt(req.query.days) || 30;
      
      // Only allow admins to run cleanup
      if (req.user.role !== 'admin') {
        return errorResponse(res, 'Permission denied', 403);
      }

      const result = await FileUploadService.cleanupOldFiles(daysOld);

      successResponse(res, result, 'File cleanup completed');
    } catch (error) {
      console.error('Cleanup files error:', error);
      errorResponse(res, error.message);
    }
  }

  // Middleware wrapper for single file upload
  handleSingleUpload(fieldName = 'file') {
    return (req, res, next) => {
      const uploadMiddleware = FileUploadService.uploadSingleMiddleware(fieldName);
      uploadMiddleware(req, res, (err) => {
        if (err) {
          return errorResponse(res, `Upload error: ${err.message}`, 400);
        }
        next();
      });
    };
  }

  // Middleware wrapper for multiple file upload
  handleMultipleUpload(fieldName = 'files', maxCount = 5) {
    return (req, res, next) => {
      const uploadMiddleware = FileUploadService.uploadMultipleMiddleware(fieldName, maxCount);
      uploadMiddleware(req, res, (err) => {
        if (err) {
          return errorResponse(res, `Upload error: ${err.message}`, 400);
        }
        next();
      });
    };
  }

  // Get upload statistics
  async getUploadStats(req, res) {
    try {
      // This would require implementing tracking in the database
      // For now, return basic info
      const stats = {
        total_uploads: 0, // Would be calculated from database
        storage_used: 0,  // Would be calculated from S3 or local storage
        avg_file_size: 0,
        most_common_types: []
      };

      successResponse(res, stats, 'Upload statistics retrieved successfully');
    } catch (error) {
      console.error('Get upload stats error:', error);
      errorResponse(res, error.message);
    }
  }
}

module.exports = new FileController();
