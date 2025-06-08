
const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

class FileUploadService {
  constructor() {
    // Local storage fallback
    this.uploadDir = process.env.UPLOAD_DIR || 'uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB
    this.allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'jpeg,jpg,png,gif,pdf,doc,docx,txt').split(',');
    
    // AWS S3 Configuration
    this.useS3 = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
    
    if (this.useS3) {
      this.s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1'
      });
      this.bucketName = process.env.S3_BUCKET_NAME || 'windsurf-uploads';
    }
    
    this.ensureUploadDirs();
  }

  async ensureUploadDirs() {
    try {
      const categories = ['attachments', 'profile_pictures', 'documents'];
      
      // Create main upload directory (for local fallback)
      await fs.mkdir(this.uploadDir, { recursive: true });
      
      // Create category subdirectories
      for (const category of categories) {
        await fs.mkdir(path.join(this.uploadDir, category), { recursive: true });
      }
    } catch (error) {
      console.error('Error creating upload directories:', error);
    }
  }

  validateFile(file) {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds limit of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Check file type
    const fileExt = path.extname(file.originalname).toLowerCase().substring(1);
    if (!this.allowedTypes.includes(fileExt)) {
      throw new Error(`File type '${fileExt}' not allowed. Allowed types: ${this.allowedTypes.join(', ')}`);
    }

    // Security: Block dangerous file types
    const dangerousTypes = ['exe', 'bat', 'cmd', 'scr', 'pif', 'com', 'js', 'jar'];
    if (dangerousTypes.includes(fileExt)) {
      throw new Error(`File type '${fileExt}' is not allowed for security reasons`);
    }

    return true;
  }

  async uploadToS3(file, category, issueId = null) {
    try {
      const fileId = uuidv4();
      const fileExt = path.extname(file.originalname);
      const filename = `${fileId}${fileExt}`;
      
      // S3 key structure: category/issueId/filename or category/filename
      const s3Key = issueId 
        ? `${category}/${issueId}/${filename}`
        : `${category}/${filename}`;

      const uploadParams = {
        Bucket: this.bucketName,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
          category: category
        }
      };

      const result = await this.s3.upload(uploadParams).promise();
      
      return {
        fileId,
        filename,
        s3Key,
        location: result.Location,
        etag: result.ETag
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  async uploadToLocal(file, category) {
    try {
      const fileId = uuidv4();
      const fileExt = path.extname(file.originalname);
      const filename = `${fileId}${fileExt}`;
      const filePath = path.join(this.uploadDir, category, filename);
      
      // Save file to disk
      await fs.writeFile(filePath, file.buffer);
      
      return {
        fileId,
        filename,
        filePath,
        location: `/uploads/${category}/${filename}`
      };
    } catch (error) {
      console.error('Local upload error:', error);
      throw new Error(`Local upload failed: ${error.message}`);
    }
  }

  async uploadFile(file, category = 'attachments', userId, issueId = null) {
    try {
      this.validateFile(file);

      let uploadResult;
      let storageType = 'local';
      let filePath = null;
      let s3Key = null;
      let s3Location = null;

      // Try S3 upload first, fallback to local
      if (this.useS3) {
        try {
          uploadResult = await this.uploadToS3(file, category, issueId);
          storageType = 's3';
          s3Key = uploadResult.s3Key;
          s3Location = uploadResult.location;
        } catch (s3Error) {
          console.warn('S3 upload failed, falling back to local storage:', s3Error.message);
          uploadResult = await this.uploadToLocal(file, category);
          filePath = uploadResult.filePath;
        }
      } else {
        uploadResult = await this.uploadToLocal(file, category);
        filePath = uploadResult.filePath;
      }

      // Save file info to database
      const [result] = await pool.execute(`
        INSERT INTO file_uploads (
          id, original_name, filename, file_path, s3_key, s3_location,
          file_size, mime_type, category, storage_type, issue_id,
          uploaded_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        uploadResult.fileId,
        file.originalname,
        uploadResult.filename,
        filePath,
        s3Key,
        s3Location,
        file.size,
        file.mimetype,
        category,
        storageType,
        issueId,
        userId
      ]);

      return {
        id: uploadResult.fileId,
        filename: uploadResult.filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        category,
        storageType,
        url: await this.getFileUrl(uploadResult.fileId),
        createdAt: new Date()
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  async generatePresignedUrl(s3Key, expiresIn = 600) {
    if (!this.useS3) {
      throw new Error('S3 not configured');
    }

    try {
      const params = {
        Bucket: this.bucketName,
        Key: s3Key,
        Expires: expiresIn // 10 minutes default
      };

      return await this.s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw error;
    }
  }

  async getFileUrl(fileId) {
    try {
      const [files] = await pool.execute(`
        SELECT storage_type, s3_key, file_path, category, filename
        FROM file_uploads
        WHERE id = ?
      `, [fileId]);

      if (files.length === 0) {
        throw new Error('File not found');
      }

      const file = files[0];

      if (file.storage_type === 's3' && this.useS3) {
        // Generate presigned URL for S3 files
        return await this.generatePresignedUrl(file.s3_key);
      } else {
        // Return local file URL
        return `/api/files/${file.category}/${file.filename}`;
      }
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }
  }

  async uploadMultipleFiles(files, category = 'attachments', userId, issueId = null) {
    const results = [];
    
    for (const file of files) {
      try {
        const result = await this.uploadFile(file, category, userId, issueId);
        results.push(result);
      } catch (error) {
        results.push({
          originalName: file.originalname,
          error: error.message
        });
      }
    }
    
    return results;
  }

  async deleteFile(filename, category, userId) {
    try {
      // Check if file exists and user has permission
      const [files] = await pool.execute(`
        SELECT id, file_path, s3_key, storage_type, uploaded_by
        FROM file_uploads
        WHERE filename = ? AND category = ?
      `, [filename, category]);

      if (files.length === 0) {
        return false;
      }

      const file = files[0];
      
      // Check if user owns the file or is admin
      if (file.uploaded_by !== userId) {
        const [userRoles] = await pool.execute(`
          SELECT r.name
          FROM rbac_roles r
          JOIN rbac_user_roles ur ON r.id = ur.role_id
          WHERE ur.user_id = ? AND r.name = 'admin'
        `, [userId]);

        if (userRoles.length === 0) {
          return false; // Not authorized
        }
      }

      // Delete from S3 if stored there
      if (file.storage_type === 's3' && file.s3_key && this.useS3) {
        try {
          await this.s3.deleteObject({
            Bucket: this.bucketName,
            Key: file.s3_key
          }).promise();
        } catch (s3Error) {
          console.error('Error deleting from S3:', s3Error);
        }
      }

      // Delete file from disk (for local storage)
      if (file.file_path) {
        try {
          await fs.unlink(file.file_path);
        } catch (fsError) {
          console.error('Error deleting file from disk:', fsError);
        }
      }

      // Delete record from database
      await pool.execute(`
        DELETE FROM file_uploads WHERE id = ?
      `, [file.id]);

      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      throw error;
    }
  }

  async getFileInfo(filename, category) {
    try {
      const [files] = await pool.execute(`
        SELECT id, original_name, filename, file_size, mime_type, 
               category, storage_type, uploaded_by, created_at
        FROM file_uploads
        WHERE filename = ? AND category = ?
      `, [filename, category]);

      if (files.length === 0) {
        return null;
      }

      const file = files[0];
      return {
        id: file.id,
        filename: file.filename,
        originalName: file.original_name,
        size: file.file_size,
        mimeType: file.mime_type,
        category: file.category,
        storageType: file.storage_type,
        uploadedBy: file.uploaded_by,
        url: await this.getFileUrl(file.id),
        createdAt: file.created_at
      };
    } catch (error) {
      console.error('Get file info error:', error);
      throw error;
    }
  }

  async getUserFiles(userId, category = null) {
    try {
      let query = `
        SELECT id, original_name, filename, file_size, mime_type, 
               category, storage_type, created_at
        FROM file_uploads
        WHERE uploaded_by = ?
      `;
      const params = [userId];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      query += ' ORDER BY created_at DESC';

      const [files] = await pool.execute(query, params);

      const filesWithUrls = await Promise.all(files.map(async (file) => ({
        id: file.id,
        filename: file.filename,
        originalName: file.original_name,
        size: file.file_size,
        mimeType: file.mime_type,
        category: file.category,
        storageType: file.storage_type,
        url: await this.getFileUrl(file.id),
        createdAt: file.created_at
      })));

      return filesWithUrls;
    } catch (error) {
      console.error('Get user files error:', error);
      throw error;
    }
  }

  // Health check for S3 connection
  async checkS3Connection() {
    if (!this.useS3) {
      return { status: 'disabled', message: 'S3 not configured' };
    }

    try {
      await this.s3.headBucket({ Bucket: this.bucketName }).promise();
      return { status: 'connected', message: 'S3 connection successful' };
    } catch (error) {
      return { status: 'error', message: `S3 connection failed: ${error.message}` };
    }
  }
}

module.exports = new FileUploadService();
