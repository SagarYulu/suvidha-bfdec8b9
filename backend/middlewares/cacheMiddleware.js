
const cacheService = require('../services/cacheService');

const cacheUserPermissions = async (req, res, next) => {
  if (req.user && req.user.id) {
    // Try to get permissions from cache
    const cachedPermissions = cacheService.getUserPermissions(req.user.id);
    
    if (cachedPermissions) {
      req.user.permissions = cachedPermissions;
    } else if (!req.user.permissions) {
      // Load permissions from database if not in cache
      try {
        const User = require('../models/User');
        const permissions = await User.getUserPermissions(req.user.id);
        req.user.permissions = permissions;
        cacheService.setUserPermissions(req.user.id, permissions);
      } catch (error) {
        console.error('Error loading user permissions:', error);
      }
    }
  }
  
  next();
};

const cacheUserData = async (req, res, next) => {
  if (req.user && req.user.id) {
    // Try to get user data from cache
    const cachedUser = cacheService.getUser(req.user.id);
    
    if (cachedUser) {
      // Merge cached data with existing user data
      req.user = { ...req.user, ...cachedUser };
    }
  }
  
  next();
};

const invalidateUserCache = (userId) => {
  return (req, res, next) => {
    // Clear user-related cache entries
    cacheService.clearUser(userId || req.user?.id);
    cacheService.clearUserPermissions(userId || req.user?.id);
    next();
  };
};

module.exports = {
  cacheUserPermissions,
  cacheUserData,
  invalidateUserCache
};
