
const NodeCache = require('node-cache');

class CacheService {
  constructor() {
    // Create different cache instances for different data types
    this.permissionCache = new NodeCache({ stdTTL: 600 }); // 10 minutes
    this.userCache = new NodeCache({ stdTTL: 300 }); // 5 minutes
    this.analyticsCache = new NodeCache({ stdTTL: 1800 }); // 30 minutes
    this.masterDataCache = new NodeCache({ stdTTL: 3600 }); // 1 hour
  }

  // Permission caching
  getUserPermissions(userId) {
    return this.permissionCache.get(`permissions_${userId}`);
  }

  setUserPermissions(userId, permissions) {
    this.permissionCache.set(`permissions_${userId}`, permissions);
  }

  clearUserPermissions(userId) {
    this.permissionCache.del(`permissions_${userId}`);
  }

  // User data caching
  getUser(userId) {
    return this.userCache.get(`user_${userId}`);
  }

  setUser(userId, userData) {
    this.userCache.set(`user_${userId}`, userData);
  }

  clearUser(userId) {
    this.userCache.del(`user_${userId}`);
  }

  // Analytics caching
  getAnalytics(key) {
    return this.analyticsCache.get(`analytics_${key}`);
  }

  setAnalytics(key, data) {
    this.analyticsCache.set(`analytics_${key}`, data);
  }

  // Master data caching
  getMasterData(type) {
    return this.masterDataCache.get(`master_${type}`);
  }

  setMasterData(type, data) {
    this.masterDataCache.set(`master_${type}`, data);
  }

  clearMasterData(type) {
    this.masterDataCache.del(`master_${type}`);
  }

  // Clear all caches
  clearAll() {
    this.permissionCache.flushAll();
    this.userCache.flushAll();
    this.analyticsCache.flushAll();
    this.masterDataCache.flushAll();
  }

  // Get cache statistics
  getStats() {
    return {
      permissions: this.permissionCache.getStats(),
      users: this.userCache.getStats(),
      analytics: this.analyticsCache.getStats(),
      masterData: this.masterDataCache.getStats()
    };
  }
}

// Export singleton instance
module.exports = new CacheService();
