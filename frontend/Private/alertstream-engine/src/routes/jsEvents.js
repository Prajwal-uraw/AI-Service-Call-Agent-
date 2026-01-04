const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Website = require('../models/Website');
const Event = require('../models/Event');
const Trigger = require('../models/Trigger');
const { enqueueSMSJob } = require('../services/queueService');
const logger = require('../utils/logger');

// CORS middleware for JS SDK
const corsOptions = {
  origin: async function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, verify origin against website's domain
    try {
      const apiKey = this.req?.headers['x-api-key'];
      if (!apiKey) {
        return callback(new Error('API key required'), false);
      }
      
      const website = await Website.findByApiKey(apiKey);
      if (!website) {
        return callback(new Error('Invalid API key'), false);
      }
      
      // Extract domain from origin
      const originDomain = new URL(origin).hostname;
      const websiteDomain = website.domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      // Check if origin matches website domain (including subdomains)
      if (originDomain === websiteDomain || originDomain.endsWith(`.${websiteDomain}`)) {
        return callback(null, true);
      }
      
      callback(new Error('Origin not allowed'), false);
    } catch (error) {
      callback(error, false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

router.use(require('cors')(corsOptions));

// JS SDK event ingestion (no HMAC required, uses API key only)
router.post('/', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const sdkVersion = req.headers['x-sdk-version'] || 'unknown';
    
    if (!apiKey) {
      return res.status(401).json({ 
        success: false, 
        error: 'API key required' 
      });
    }
    
    // Get website by API key
    const website = await Website.findByApiKey(apiKey);
    if (!website) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid API key' 
      });
    }
    
    const { event_type, metadata } = req.body;
    
    // Store event
    const event = await Event.create({
      id: uuidv4(),
      website_id: website.id,
      event_type,
      payload: {
        ...metadata,
        sdk_version: sdkVersion,
        ingestion_method: 'js_sdk'
      },
      ingested_at: new Date()
    });
    
    // Find matching triggers
    const triggers = await Trigger.findActiveByWebsiteAndType(
      website.id, 
      event_type
    );
    
    if (triggers.length > 0) {
      for (const trigger of triggers) {
        await enqueueSMSJob({
          trigger_id: trigger.id,
          event_id: event.id,
          website_id: website.id,
          event_type,
          metadata: metadata
        });
      }
      
      logger.info(`JS SDK event ${event.id} for ${website.domain}`, {
        event_type,
        sdk_version: sdkVersion,
        triggers_matched: triggers.length
      });
    }
    
    // Return success
    res.status(202).json({ 
      success: true, 
      event_id: event.id 
    });
    
  } catch (error) {
    logger.error('JS SDK ingestion error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process event' 
    });
  }
});

// Health check for JS SDK
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    sdk_supported: true,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
