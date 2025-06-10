
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { HTTP_STATUS } = require('../config/constants');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.UPLOAD_ALLOWED_TYPES?.split(',') || [
    'image/jpeg', 'image/png', 'image/gif', 'application/pdf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 10485760 // 10MB default
  },
  fileFilter: fileFilter
});

class FileController {
  // Middleware for single file upload
  static uploadSingle(fieldName) {
    return upload.single(fieldName);
  }

  // Middleware for multiple file upload
  static uploadMultiple(fieldName, maxCount = 5) {
    return upload.array(fieldName, maxCount);
  }

  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'No file uploaded'
        });
      }

      const fileData = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: `/api/files/download/${req.file.filename}`
      };

      res.status(HTTP_STATUS.CREATED).json({
        message: 'File uploaded successfully',
        data: fileData
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'File upload failed',
        message: error.message
      });
    }
  }

  async uploadMultipleFiles(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'No files uploaded'
        });
      }

      const filesData = req.files.map(file => ({
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/api/files/download/${file.filename}`
      }));

      res.status(HTTP_STATUS.CREATED).json({
        message: 'Files uploaded successfully',
        data: filesData
      });
    } catch (error) {
      console.error('Multiple files upload error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Files upload failed',
        message: error.message
      });
    }
  }

  async downloadFile(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../uploads', filename);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'File not found'
        });
      }

      res.download(filePath);
    } catch (error) {
      console.error('File download error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'File download failed',
        message: error.message
      });
    }
  }

  async deleteFile(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../uploads', filename);

      try {
        await fs.unlink(filePath);
        res.status(HTTP_STATUS.OK).json({
          message: 'File deleted successfully'
        });
      } catch (error) {
        if (error.code === 'ENOENT') {
          return res.status(HTTP_STATUS.NOT_FOUND).json({
            error: 'File not found'
          });
        }
        throw error;
      }
    } catch (error) {
      console.error('File deletion error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'File deletion failed',
        message: error.message
      });
    }
  }
}

module.exports = new FileController();
