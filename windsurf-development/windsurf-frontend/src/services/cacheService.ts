
class CacheService {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl: number = this.defaultTTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string) {
    return this.get(key) !== null;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Cache invalidation patterns
  invalidatePattern(pattern: string) {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Wrapper for async functions with caching
  async cached<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    ttl: number = this.defaultTTL
  ): Promise<T> {
    // Check cache first
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch and cache
    try {
      const data = await fetchFn();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Preload cache with data
  preload(key: string, data: any, ttl: number = this.defaultTTL) {
    this.set(key, data, ttl);
  }

  // Get cache statistics
  getStats() {
    let totalSize = 0;
    let expiredCount = 0;
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      totalSize += JSON.stringify(item.data).length;
      if (now - item.timestamp > item.ttl) {
        expiredCount++;
      }
    }
    
    return {
      totalKeys: this.cache.size,
      totalSize,
      expiredCount
    };
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    return keysToDelete.length;
  }
}

export const cacheService = new CacheService();

// Auto cleanup every 5 minutes
setInterval(() => {
  const cleaned = cacheService.cleanup();
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} expired cache entries`);
  }
}, 5 * 60 * 1000);
