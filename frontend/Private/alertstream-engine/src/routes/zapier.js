const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Website = require('../models/Website');
const Event = require('../models/Event');
const Trigger = require('../models/Trigger');
const { enqueueSMSJob } = require('../services/queueService');
const logger = require('../utils/logger');

// Zapier webhook ingestion
router.post('/webhook/:apiKey', async (req, res) => {
  try {
    const { apiKey } = req.params;
    const { event_type, metadata } = req.body;
    
    // Get website by API key
    const website = await Website.findByApiKey(apiKey);
    if (!website) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid API key' 
      });
    }
    
    // Store event
    const event = await Event.create({
      id: uuidv4(),
      website_id: website.id,
      event_type: `zapier:${event_type}`,
      payload: {
        ...metadata,
        source: 'zapier',
        webhook_id: req.body.webhook_id || 'unknown'
      },
      ingested_at: new Date()
    });
    
    // Find matching triggers (both exact and wildcard)
    const triggers = await Trigger.findActiveByWebsiteAndType(
      website.id, 
      `zapier:${event_type}`
    );
    
    // Also check for wildcard triggers
    const wildcardTriggers = await Trigger.findActiveByWebsiteAndType(
      website.id, 
      'zapier:*'
    );
    
    const allTriggers = [...triggers, ...wildcardTriggers];
    
    if (allTriggers.length > 0) {
      for (const trigger of allTriggers) {
        await enqueueSMSJob({
          trigger_id: trigger.id,
          event_id: event.id,
          website_id: website.id,
          event_type: `zapier:${event_type}`,
          metadata: metadata
        });
      }
      
      logger.info(`Zapier webhook event ${event.id} for ${website.domain}`, {
        event_type,
        triggers_matched: allTriggers.length
      });
    }
    
    res.status(202).json({ 
      success: true, 
      event_id: event.id,
      triggers_matched: allTriggers.length
    });
    
  } catch (error) {
    logger.error('Zapier webhook error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process webhook' 
    });
  }
});

// Generate Zapier webhook URL
router.post('/generate-webhook', async (req, res) => {
  try {
    const { apiKey, eventTypes = [] } = req.body;
    
    const website = await Website.findByApiKey(apiKey);
    if (!website) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid API key' 
      });
    }
    
    // Create triggers for each event type
    const createdTriggers = [];
    for (const eventType of eventTypes) {
      const trigger = await Trigger.create({
        websiteId: website.id,
        eventType: `zapier:${eventType}`,
        isActive: true
      });
      createdTriggers.push(trigger);
    }
    
    // Generate webhook URL
    const webhookUrl = `${req.protocol}://${req.get('host')}/api/v1/zapier/webhook/${website.api_key}`;
    
    res.json({
      success: true,
      webhook_url: webhookUrl,
      triggers_created: createdTriggers.length,
      usage: `Send POST requests to this URL with JSON body: {
        "event_type": "your_event_name",
        "metadata": { "any": "data" }
      }`
    });
    
  } catch (error) {
    logger.error('Webhook generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate webhook' 
    });
  }
});

module.exports = router;
