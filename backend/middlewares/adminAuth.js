
const { HTTP_STATUS } = require('../config/constants');

const requireAdminAccess = (req, res, next) => {
  const user = req.user;
  
  if (!user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  const adminRoles = ['City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'];
  const adminEmails = ['sagar.km@yulu.bike', 'admin@yulu.com'];
  
  const isAdminRole = adminRoles.includes(user.role);
  const isAdminEmail = adminEmails.includes(user.email);
  
  if (!isAdminRole && !isAdminEmail) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: 'Access denied',
      message: 'Admin access required for this endpoint'
    });
  }
  
  next();
};

module.exports = {
  requireAdminAccess
};
