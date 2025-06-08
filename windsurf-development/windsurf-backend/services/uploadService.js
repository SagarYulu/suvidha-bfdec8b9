
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

class UploadService {
  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME;
    this.allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
  }

  async uploadFile(file, category = 'attachments', userId, issueId = null) {
    try {
      // Validate file
      this.validateFile(file);

      const fileId = uuidv4();
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${category}/${fileId}.${fileExt}`;

      // Upload to S3
      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          'original-name': file.originalname,
          'uploaded-by': userId,
          'category': category
        }
      };

      const s3Result = await s3.upload(uploadParams).promise();

      // Store file metadata in database
      const query = `
        INSERT INTO file_attachments 
        (id, original_name, filename, file_path, file_size, mime_type, category, uploaded_by, issue_id, s3_key, s3_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await pool.execute(query, [
        fileId,
        file.originalname,
        fileName,
        s3Result.Location,
        file.size,
        file.mimetype,
        category,
        userId,
        issueId,
        fileName,
        s3Result.Location
      ]);

      return {
        success: true,
        file: {
          id: fileId,
          originalName: file.originalname,
          filename: fileName,
          size: file.size,
          mimetype: file.mimetype,
          url: s3Result.Location,
          category
        }
      };
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async uploadMultipleFiles(files, category = 'attachments', userId, issueId = null) {
    const results = [];

    for (const file of files) {
      const result = await this.uploadFile(file, category, userId, issueId);
      results.push(result);
    }

    return results;
  }

  async getFileUrl(fileId) {
    try {
      // Get file info from database
      const query = 'SELECT * FROM file_attachments WHERE id = ?';
      const [rows] = await pool.execute(query, [fileId]);

      if (rows.length === 0) {
        return null;
      }

      const file = rows[0];

      // Generate presigned URL for S3 file
      const params = {
        Bucket: this.bucketName,
        Key: file.s3_key,
        Expires: 3600 // 1 hour
      };

      const presignedUrl = await s3.getSignedUrlPromise('getObject', params);
      return presignedUrl;
    } catch (error) {
      console.error('Error generating file URL:', error);
      throw error;
    }
  }

  async deleteFile(filename, category, userId) {
    try {
      // Get file info
      const query = 'SELECT * FROM file_attachments WHERE filename = ? AND category = ? AND uploaded_by = ?';
      const [rows] = await pool.execute(query, [filename, category, userId]);

      if (rows.length === 0) {
        return false;
      }

      const file = rows[0];

      // Delete from S3
      const deleteParams = {
        Bucket: this.bucketName,
        Key: file.s3_key
      };

      await s3.deleteObject(deleteParams).promise();

      // Delete from database
      await pool.execute('DELETE FROM file_attachments WHERE id = ?', [file.id]);

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async getFileInfo(filename, category) {
    try {
      const query = 'SELECT * FROM file_attachments WHERE filename = ? AND category = ?';
      const [rows] = await pool.execute(query, [filename, category]);

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error getting file info:', error);
      throw error;
    }
  }

  async getUserFiles(userId, category = null) {
    try {
      let query = 'SELECT * FROM file_attachments WHERE uploaded_by = ?';
      const params = [userId];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      query += ' ORDER BY created_at DESC';

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error getting user files:', error);
      throw error;
    }
  }

  async checkS3Connection() {
    try {
      await s3.headBucket({ Bucket: this.bucketName }).promise();
      return { status: 'connected', message: 'S3 bucket accessible' };
    } catch (error) {
      console.error('S3 connection error:', error);
      return { status: 'error', message: error.message };
    }
  }

  validateFile(file) {
    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} not allowed`);
    }

    return true;
  }
}

module.exports = new UploadService();
