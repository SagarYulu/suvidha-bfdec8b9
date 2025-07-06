
// Simple in-memory cache service for user data
class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes TTL
  }

  setUser(userId, userData) {
    this.cache.set(`user:${userId}`, {
      data: userData,
      timestamp: Date.now()
    });
  }

  getUser(userId) {
    const cached = this.cache.get(`user:${userId}`);
    
    if (!cached) {
      return null;
    }
    
    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(`user:${userId}`);
      return null;
    }
    
    return cached.data;
  }

  clearUser(userId) {
    this.cache.delete(`user:${userId}`);
  }

  clear() {
    this.cache.clear();
  }
}

module.exports = new CacheService();
