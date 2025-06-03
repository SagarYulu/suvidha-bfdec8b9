
const AuthService = require('../services/AuthService');
const UserService = require('../services/UserService');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = AuthService.verifyToken(token);
    const user = await UserService.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
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
    const IssueService = require('../services/IssueService');
    const issue = await IssueService.getIssueById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    if (issue.employeeUuid !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    next();
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
