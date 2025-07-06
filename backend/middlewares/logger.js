
const morgan = require('morgan');

// Custom token for user info
morgan.token('user', (req) => {
  return req.user ? `${req.user.email} (${req.user.role})` : 'anonymous';
});

// Custom token for response time in ms
morgan.token('response-time-ms', (req, res) => {
  const responseTime = parseFloat(res.getHeader('X-Response-Time'));
  return responseTime ? `${responseTime}ms` : '-';
});

// Custom format
const logFormat = ':method :url :status :res[content-length] - :response-time ms - User: :user';

const logger = morgan(logFormat, {
  skip: (req, res) => {
    // Skip logging for health checks and static files
    return req.url === '/api/health' || req.url.startsWith('/uploads');
  }
});

module.exports = logger;
