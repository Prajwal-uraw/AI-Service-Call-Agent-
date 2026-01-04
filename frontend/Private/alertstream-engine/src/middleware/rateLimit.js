const rateLimit = require('express-rate-limit');

class RateLimitMiddleware {
  byWebsite(max, window) {
    const windowMs = window === 'minute' ? 60000 : window === 'hour' ? 3600000 : 60000;
    
    return rateLimit({
      windowMs,
      max,
      keyGenerator: (req) => {
        // Use website ID or API key as the rate limit key
        return req.website?.id || req.headers['x-api-key'] || req.ip;
      },
      message: {
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }
  
  byIP(max, windowMs = 60000) {
    return rateLimit({
      windowMs,
      max,
      keyGenerator: (req) => req.ip,
      message: {
        error: 'Too many requests from this IP',
        retryAfter: Math.ceil(windowMs / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }
  
  global(max = 1000, windowMs = 60000) {
    return rateLimit({
      windowMs,
      max,
      message: {
        error: 'Server is busy, please try again later'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }
}

module.exports = new RateLimitMiddleware();
