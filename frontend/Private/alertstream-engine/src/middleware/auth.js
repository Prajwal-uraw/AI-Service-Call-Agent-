const crypto = require('crypto');
const Website = require('../models/Website');
const logger = require('../utils/logger');

class AuthMiddleware {
  async hmacAuth(req, res, next) {
    try {
      const apiKey = req.headers['x-api-key'];
      const signature = req.headers['x-signature'];
      const timestamp = req.headers['x-timestamp'];
      
      if (!apiKey || !signature || !timestamp) {
        return res.status(401).json({ 
          error: 'Missing authentication headers' 
        });
      }
      
      // Check timestamp (prevent replay attacks)
      const requestTime = parseInt(timestamp);
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (Math.abs(currentTime - requestTime) > 300) { // 5 minutes
        return res.status(401).json({ 
          error: 'Request timestamp is too old or in future' 
        });
      }
      
      // Get website by API key
      const website = await Website.findByApiKey(apiKey);
      if (!website) {
        return res.status(401).json({ 
          error: 'Invalid API key' 
        });
      }
      
      // Verify HMAC signature
      const expectedSignature = crypto
        .createHmac('sha256', website.secret_key)
        .update(JSON.stringify(req.body) + ':' + timestamp)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        logger.warn('Invalid HMAC signature', {
          website: website.domain,
          ip: req.ip
        });
        return res.status(401).json({ 
          error: 'Invalid signature' 
        });
      }
      
      // Attach website to request
      req.website = website;
      next();
      
    } catch (error) {
      logger.error('Authentication error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  }
  
  async jwtAuth(req, res, next) {
    // For future dashboard API (not needed for MVP)
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Verify JWT (implementation depends on your auth system)
    // For now, just pass through
    next();
  }
}

module.exports = new AuthMiddleware();
