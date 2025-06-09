
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const pool = require('../config/database');

class FileUploadService {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
    
    this.bucketName = process.env.S3_BUCKET_NAME || 'grievance-portal-files';
    this.allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
  }

  async generatePresignedUrl(fileName, fileType, userId, issueId = null) {
    try {
      // Validate file type
      if (!this.allowedMimeTypes.includes(fileType)) {
        throw new Error(`File type ${fileType} not allowed`);
      }

      const fileId = uuidv4();
      const fileExt = path.extname(fileName);
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const s3Key = `attachments/${fileId}${fileExt}`;

      const uploadUrl = await this.s3.getSignedUrlPromise('putObject', {
        Bucket: this.bucketName,
        Key: s3Key,
        ContentType: fileType,
        Expires: 300, // 5 minutes
        Conditions: [
          ['content-length-range', 0, this.maxFileSize],
          ['eq', '$Content-Type', fileType]
        ]
      });

      // Store file metadata in database
      const [result] = await pool.execute(`
        INSERT INTO file_attachments 
        (id, issue_id, file_name, original_name, file_url, mime_type, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        fileId,
        issueId,
        s3Key,
        sanitizedName,
        `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`,
        fileType,
        userId
      ]);

      return {
        fileId,
        uploadUrl,
        s3Key,
        publicUrl: `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`
      };
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw error;
    }
  }

  async uploadComplete(fileId, fileSize) {
    try {
      await pool.execute(`
        UPDATE file_attachments 
        SET file_size = ?, uploaded_at = NOW()
        WHERE id = ?
      `, [fileSize, fileId]);

      return { success: true };
    } catch (error) {
      console.error('Error completing upload:', error);
      throw error;
    }
  }

  async getFilesByIssue(issueId) {
    try {
      const [files] = await pool.execute(`
        SELECT * FROM file_attachments 
        WHERE issue_id = ? 
        ORDER BY uploaded_at DESC
      `, [issueId]);

      return files;
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  }

  async deleteFile(fileId, userId) {
    try {
      // Get file info
      const [files] = await pool.execute(`
        SELECT * FROM file_attachments 
        WHERE id = ? AND uploaded_by = ?
      `, [fileId, userId]);

      if (files.length === 0) {
        throw new Error('File not found or access denied');
      }

      const file = files[0];

      // Delete from S3
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: file.file_name
      }).promise();

      // Delete from database
      await pool.execute(`
        DELETE FROM file_attachments WHERE id = ?
      `, [fileId]);

      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async generateDownloadUrl(fileId, userId) {
    try {
      const [files] = await pool.execute(`
        SELECT * FROM file_attachments WHERE id = ?
      `, [fileId]);

      if (files.length === 0) {
        throw new Error('File not found');
      }

      const file = files[0];
      
      const downloadUrl = await this.s3.getSignedUrlPromise('getObject', {
        Bucket: this.bucketName,
        Key: file.file_name,
        Expires: 3600 // 1 hour
      });

      return downloadUrl;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw error;
    }
  }
}

module.exports = new FileUploadService();
