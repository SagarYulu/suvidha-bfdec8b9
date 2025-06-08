
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

class FileUploadService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../uploads');
    this.ensureUploadDirectory();
  }

  async ensureUploadDirectory() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      
      // Create subdirectories for different file types
      await fs.mkdir(path.join(this.uploadsDir, 'issues'), { recursive: true });
      await fs.mkdir(path.join(this.uploadsDir, 'attachments'), { recursive: true });
      await fs.mkdir(path.join(this.uploadsDir, 'temp'), { recursive: true });
    } catch (error) {
      console.error('Error creating upload directories:', error);
    }
  }

  getMulterConfig(destination = 'attachments') {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(this.uploadsDir, destination));
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
      }
    });

    return multer({
      storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Max 5 files per upload
      },
      fileFilter: (req, file, cb) => {
        // Allow common file types
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xlsx|xls/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
        }
      }
    });
  }

  async deleteFile(filePath) {
    try {
      const fullPath = path.join(this.uploadsDir, filePath);
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  generateFileUrl(filename, category = 'attachments') {
    return `/api/files/${category}/${filename}`;
  }

  async getFileInfo(filePath) {
    try {
      const fullPath = path.join(this.uploadsDir, filePath);
      const stats = await fs.stat(fullPath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      return null;
    }
  }
}

module.exports = new FileUploadService();
