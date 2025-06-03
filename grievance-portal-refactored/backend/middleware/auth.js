
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const checkIssueAccess = async (req, res, next) => {
  try {
    const issueId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Admin and support can access all issues
    if (['admin', 'support'].includes(userRole)) {
      return next();
    }

    // Regular users can only access their own issues
    const query = 'SELECT employee_uuid FROM issues WHERE id = ?';
    db.query(query, [issueId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      if (results[0].employee_uuid !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      next();
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  checkIssueAccess
};
