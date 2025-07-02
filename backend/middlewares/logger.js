
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';
  
  // Log the request
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  
  // Log request body for POST/PUT/PATCH (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
    const sanitizedBody = { ...req.body };
    
    // Remove sensitive fields
    delete sanitizedBody.password;
    delete sanitizedBody.token;
    delete sanitizedBody.secret;
    
    if (Object.keys(sanitizedBody).length > 0) {
      console.log(`[${timestamp}] Request Body:`, JSON.stringify(sanitizedBody, null, 2));
    }
  }

  // Store original send function
  const originalSend = res.send;
  
  // Override send to log response
  res.send = function(data) {
    const responseTime = Date.now() - req.startTime;
    console.log(`[${timestamp}] Response: ${res.statusCode} - ${responseTime}ms`);
    
    // Call original send
    originalSend.call(this, data);
  };
  
  // Store request start time
  req.startTime = Date.now();
  
  next();
};

module.exports = logger;
