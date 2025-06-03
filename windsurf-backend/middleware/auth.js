
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

const checkIssueAccess = async (req, res, next) => {
  try {
    const issueId = req.params.id;
    const user = req.user;

    // Admin and support can access all issues
    if (['admin', 'support'].includes(user.role)) {
      return next();
    }

    // Employees can only access their own issues
    const query = 'SELECT employee_uuid FROM issues WHERE id = ?';
    
    db.query(query, [issueId], (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Issue not found'
        });
      }

      const issue = results[0];
      if (issue.employee_uuid !== user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      next();
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authorization check failed'
    });
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  checkIssueAccess
};
