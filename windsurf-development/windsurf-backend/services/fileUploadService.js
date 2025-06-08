
const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

class FileUploadService {
  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME;
    this.allowedFileTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
  }

  // Multer configuration for memory storage
  getMulterConfig() {
    return multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: this.maxFileSize
      },
      fileFilter: (req, file, cb) => {
        const fileExt = path.extname(file.originalname).toLowerCase();
        if (this.allowedFileTypes.includes(fileExt)) {
          cb(null, true);
        } else {
          cb(new Error(`File type ${fileExt} not allowed`), false);
        }
      }
    });
  }

  async uploadToS3(file, folder = 'attachments') {
    try {
      const fileExt = path.extname(file.originalname);
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;
      
      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private' // Files are private by default
      };
      
      const result = await s3.upload(uploadParams).promise();
      
      return {
        key: fileName,
        url: result.Location,
        size: file.size,
        mimetype: file.mimetype,
        originalName: file.originalname
      };
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw new Error('File upload failed');
    }
  }

  async generatePresignedUrl(key, expiresIn = 3600) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: expiresIn // 1 hour by default
      };
      
      const url = await s3.getSignedUrlPromise('getObject', params);
      return url;
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error('Failed to generate download link');
    }
  }

  async deleteFile(key) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key
      };
      
      await s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('File deletion failed');
    }
  }

  async uploadMultipleFiles(files, folder = 'attachments') {
    try {
      const uploadPromises = files.map(file => this.uploadToS3(file, folder));
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw new Error('Multiple file upload failed');
    }
  }

  validateFile(file) {
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (!this.allowedFileTypes.includes(fileExt)) {
      throw new Error(`File type ${fileExt} not allowed`);
    }
    
    if (file.size > this.maxFileSize) {
      throw new Error('File size exceeds maximum limit');
    }
    
    return true;
  }
}

module.exports = new FileUploadService();
