
const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');
const { v4: uuidv4 } = require('uuid');

class FileUploadService {
  constructor() {
    // Configure AWS S3
    if (config.aws.accessKeyId) {
      this.s3 = new AWS.S3({
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
        region: config.aws.region
      });
      this.useS3 = true;
    } else {
      this.useS3 = false;
      console.log('AWS credentials not configured, using local file storage');
    }

    // Configure multer for file uploads
    this.upload = multer({
      storage: this.useS3 ? multer.memoryStorage() : this.getLocalStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Maximum 5 files per upload
      },
      fileFilter: this.fileFilter
    });
  }

  getLocalStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });
  }

  fileFilter(req, file, cb) {
    // Allowed file types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
  }

  async uploadToS3(file, folder = 'attachments') {
    try {
      const key = `${folder}/${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
      
      const params = {
        Bucket: config.aws.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private' // Files are private by default
      };

      const result = await this.s3.upload(params).promise();
      
      return {
        success: true,
        url: result.Location,
        key: result.Key,
        bucket: result.Bucket,
        size: file.size,
        mimetype: file.mimetype,
        originalName: file.originalname
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error(`Failed to upload to S3: ${error.message}`);
    }
  }

  async uploadLocally(file) {
    try {
      // File is already saved by multer, just return the info
      const url = `/uploads/${file.filename}`;
      
      return {
        success: true,
        url: url,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        originalName: file.originalname
      };
    } catch (error) {
      console.error('Local upload error:', error);
      throw new Error(`Failed to upload locally: ${error.message}`);
    }
  }

  async uploadSingle(file, folder = 'attachments') {
    try {
      if (this.useS3) {
        return await this.uploadToS3(file, folder);
      } else {
        return await this.uploadLocally(file);
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async uploadMultiple(files, folder = 'attachments') {
    try {
      const uploadPromises = files.map(file => this.uploadSingle(file, folder));
      const results = await Promise.all(uploadPromises);
      
      return {
        success: true,
        files: results,
        count: results.length
      };
    } catch (error) {
      console.error('Multiple upload error:', error);
      throw error;
    }
  }

  async deleteFile(fileKey) {
    try {
      if (this.useS3) {
        const params = {
          Bucket: config.aws.bucketName,
          Key: fileKey
        };
        
        await this.s3.deleteObject(params).promise();
      } else {
        // For local files, fileKey would be the file path
        const filePath = path.join(__dirname, '../', fileKey);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Delete file error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getSignedUrl(fileKey, expires = 3600) {
    try {
      if (!this.useS3) {
        // For local files, return the direct URL
        return `/uploads/${fileKey}`;
      }

      const params = {
        Bucket: config.aws.bucketName,
        Key: fileKey,
        Expires: expires // URL expires in 1 hour by default
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);
      return url;
    } catch (error) {
      console.error('Get signed URL error:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  // Middleware for single file upload
  uploadSingleMiddleware(fieldName = 'file') {
    return this.upload.single(fieldName);
  }

  // Middleware for multiple file upload
  uploadMultipleMiddleware(fieldName = 'files', maxCount = 5) {
    return this.upload.array(fieldName, maxCount);
  }

  // Middleware for mixed file uploads (different field names)
  uploadFieldsMiddleware(fields) {
    return this.upload.fields(fields);
  }

  // Get file info without downloading
  async getFileInfo(fileKey) {
    try {
      if (this.useS3) {
        const params = {
          Bucket: config.aws.bucketName,
          Key: fileKey
        };
        
        const result = await this.s3.headObject(params).promise();
        
        return {
          size: result.ContentLength,
          lastModified: result.LastModified,
          contentType: result.ContentType,
          metadata: result.Metadata
        };
      } else {
        const filePath = path.join(__dirname, '../', fileKey);
        const stats = fs.statSync(filePath);
        
        return {
          size: stats.size,
          lastModified: stats.mtime,
          contentType: 'application/octet-stream' // Default type for local files
        };
      }
    } catch (error) {
      console.error('Get file info error:', error);
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  // Clean up old files (for local storage)
  async cleanupOldFiles(daysOld = 30) {
    if (this.useS3) {
      console.log('S3 cleanup should be handled by lifecycle policies');
      return { cleaned: 0 };
    }

    try {
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) {
        return { cleaned: 0 };
      }

      const files = fs.readdirSync(uploadDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let cleanedCount = 0;

      for (const file of files) {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          cleanedCount++;
        }
      }

      console.log(`Cleaned up ${cleanedCount} old files`);
      return { cleaned: cleanedCount };
    } catch (error) {
      console.error('Cleanup error:', error);
      throw error;
    }
  }
}

module.exports = new FileUploadService();
