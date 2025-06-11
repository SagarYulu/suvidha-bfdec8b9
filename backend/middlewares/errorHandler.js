
const { HTTP_STATUS } = require('../config/constants');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Default error
  let error = {
    success: false,
    error: 'Internal server error',
    message: 'Something went wrong'
  };

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.error = 'Resource not found';
    error.message = 'Invalid ID format';
    return res.status(HTTP_STATUS.NOT_FOUND).json(error);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.error = 'Duplicate field value';
    error.message = `${field} already exists`;
    return res.status(HTTP_STATUS.CONFLICT).json(error);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error.error = 'Validation error';
    error.message = messages.join(', ');
    return res.status(HTTP_STATUS.BAD_REQUEST).json(error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.error = 'Invalid token';
    error.message = 'Please login again';
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.error = 'Token expired';
    error.message = 'Please login again';
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(error);
  }

  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    error.error = 'Duplicate entry';
    error.message = 'Record already exists';
    return res.status(HTTP_STATUS.CONFLICT).json(error);
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error.error = 'Invalid reference';
    error.message = 'Referenced record does not exist';
    return res.status(HTTP_STATUS.BAD_REQUEST).json(error);
  }

  // Custom application errors
  if (err.statusCode) {
    error.error = err.message;
    error.message = err.message;
    return res.status(err.statusCode).json(error);
  }

  // Development vs Production
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
    error.details = err;
  }

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error);
};

module.exports = errorHandler;
