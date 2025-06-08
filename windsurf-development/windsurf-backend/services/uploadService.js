
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

class UploadService {
  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || 'uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB
    this.allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'jpeg,jpg,png,gif,pdf,doc,docx,txt').split(',');
    this.ensureUploadDirs();
  }

  async ensureUploadDirs() {
    try {
      const categories = ['attachments', 'profile_pictures', 'documents'];
      
      // Create main upload directory
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

    return true;
  }

  async uploadFile(file, category = 'attachments', userId) {
    try {
      this.validateFile(file);

      const fileId = uuidv4();
      const fileExt = path.extname(file.originalname);
      const filename = `${fileId}${fileExt}`;
      const filePath = path.join(this.uploadDir, category, filename);
      
      // Save file to disk
      await fs.writeFile(filePath, file.buffer);

      // Save file info to database
      const [result] = await pool.execute(`
        INSERT INTO file_uploads (
          id, original_name, filename, file_path, file_size, 
          mime_type, category, uploaded_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        fileId,
        file.originalname,
        filename,
        filePath,
        file.size,
        file.mimetype,
        category,
        userId
      ]);

      return {
        id: fileId,
        filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        category,
        url: `/api/upload/${category}/${filename}`,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  async uploadMultipleFiles(files, category = 'attachments', userId) {
    const results = [];
    
    for (const file of files) {
      try {
        const result = await this.uploadFile(file, category, userId);
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
        SELECT id, file_path, uploaded_by
        FROM file_uploads
        WHERE filename = ? AND category = ?
      `, [filename, category]);

      if (files.length === 0) {
        return false;
      }

      const file = files[0];
      
      // Check if user owns the file or is admin
      if (file.uploaded_by !== userId) {
        // Check if user is admin
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

      // Delete file from disk
      try {
        await fs.unlink(file.file_path);
      } catch (error) {
        console.error('Error deleting file from disk:', error);
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
               category, uploaded_by, created_at
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
        uploadedBy: file.uploaded_by,
        url: `/api/upload/${category}/${filename}`,
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
               category, created_at
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

      return files.map(file => ({
        id: file.id,
        filename: file.filename,
        originalName: file.original_name,
        size: file.file_size,
        mimeType: file.mime_type,
        category: file.category,
        url: `/api/upload/${file.category}/${file.filename}`,
        createdAt: file.created_at
      }));
    } catch (error) {
      console.error('Get user files error:', error);
      throw error;
    }
  }
}

module.exports = new UploadService();
