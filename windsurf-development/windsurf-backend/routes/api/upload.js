
const express = require('express');
const multer = require('multer');
const router = express.Router();
const fileUploadService = require('../../services/actualFileUploadService');
const { authenticateToken } = require('../../middleware/auth');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Single file upload
router.post('/single', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const category = req.body.category || 'attachments';
    const userId = req.user.id;

    const result = await fileUploadService.uploadFile(req.file, category, userId);
    
    if (result.success) {
      res.json({ file: result.file });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Multiple files upload
router.post('/multiple', authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const category = req.body.category || 'attachments';
    const userId = req.user.id;

    const results = await fileUploadService.uploadMultipleFiles(req.files, category, userId);
    
    const successfulUploads = results.filter(r => r.success);
    const failedUploads = results.filter(r => !r.success);

    res.json({
      uploaded: successfulUploads.map(r => r.file),
      failed: failedUploads.map(r => ({ error: r.error })),
      total: results.length,
      successful: successfulUploads.length
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Generate presigned URL for file download
router.get('/download/:key(*)', authenticateToken, async (req, res) => {
  try {
    const key = req.params.key;
    const url = await fileUploadService.generatePresignedUrl(key);
    res.json({ url });
  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

// Delete file
router.delete('/:category/:filename', authenticateToken, async (req, res) => {
  try {
    const { category, filename } = req.params;
    const key = `${category}/${filename}`;
    
    await fileUploadService.deleteFile(key);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Check S3 connection status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const status = await fileUploadService.checkS3Connection();
    res.json(status);
  } catch (error) {
    console.error('Error checking S3 status:', error);
    res.status(500).json({ error: 'Failed to check S3 status' });
  }
});

module.exports = router;
