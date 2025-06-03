
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// Generate random string
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Format date to MySQL datetime
const formatDateForMySQL = (date = new Date()) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

// Validate UUID format
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Ensure upload directory exists
const ensureUploadDir = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Clean file name
const cleanFileName = (fileName) => {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
};

// Paginate results
const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return {
    limit: parseInt(limit),
    offset: parseInt(offset)
  };
};

// Calculate time difference in hours
const getHoursDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.abs(end - start) / 36e5;
};

module.exports = {
  generateRandomString,
  formatDateForMySQL,
  isValidUUID,
  ensureUploadDir,
  cleanFileName,
  paginate,
  getHoursDifference
};
