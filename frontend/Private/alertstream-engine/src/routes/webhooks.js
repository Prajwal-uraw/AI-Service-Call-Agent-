const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Website = require('../models/Website');
const Event = require('../models/Event');
const Trigger = require('../models/Trigger');
const { enqueueSMSJob } = require('../services/queueService');
const logger = require('../utils/logger');

// Generic webhook endpoint for third-party integrations
router.post('/:apiKey', async (req, res) => {
  try {
    const { apiKey } = req.params;
    
    // Get website by API key
    const website = await Website.findByApiKey(apiKey);
    if (!website) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid API key' 
      });
    }
    
    // Extract event info from various webhook formats
    const eventData = normalizeWebhookPayload(req.body, req.headers);
    
    // Store event
    const event = await Event.create({
      id: uuidv4(),
      website_id: website.id,
      event_type: eventData.event_type,
      payload: eventData.payload,
      ingested_at: new Date()
    });
    
    // Find matching triggers
    const triggers = await Trigger.findActiveByWebsiteAndType(
      website.id, 
      eventData.event_type
    );
    
    if (triggers.length > 0) {
      for (const trigger of triggers) {
        await enqueueSMSJob({
          trigger_id: trigger.id,
          event_id: event.id,
          website_id: website.id,
          event_type: eventData.event_type,
          metadata: eventData.payload
        });
      }
      
      logger.info(`Webhook event ${event.id} for ${website.domain}`, {
        event_type: eventData.event_type,
        triggers_matched: triggers.length
      });
    }
    
    res.status(202).json({ 
      success: true, 
      event_id: event.id,
      triggers_matched: triggers.length
    });
    
  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process webhook' 
    });
  }
});

// Normalize different webhook payload formats
function normalizeWebhookPayload(body, headers) {
  // Check for common webhook formats
  
  // Stripe format
  if (body.type && body.data && body.data.object) {
    return {
      event_type: `stripe:${body.type}`,
      payload: {
        ...body.data.object,
        stripe_event_id: body.id
      }
    };
  }
  
  // GitHub format
  if (headers['x-github-event']) {
    return {
      event_type: `github:${headers['x-github-event']}`,
      payload: body
    };
  }
  
  // Typeform format
  if (body.form_response) {
    return {
      event_type: 'typeform:form_submit',
      payload: {
        form_id: body.form_response.form_id,
        answers: body.form_response.answers,
        submitted_at: body.form_response.submitted_at
      }
    };
  }
  
  // Generic format
  return {
    event_type: body.event_type || body.type || 'webhook:generic',
    payload: body.data || body.metadata || body
  };
}

// Webhook verification endpoint (for services that require it)
router.get('/:apiKey', async (req, res) => {
  const { apiKey } = req.params;
  
  // Verify the API key exists
  const website = await Website.findByApiKey(apiKey);
  if (!website) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  // Return challenge response for webhook verification
  const challenge = req.query.challenge || req.query['hub.challenge'];
  if (challenge) {
    return res.send(challenge);
  }
  
  res.json({ 
    status: 'active',
    webhook_url: `${req.protocol}://${req.get('host')}${req.originalUrl}`
  });
});

// Twilio SMS status callback
router.post('/twilio/status', async (req, res) => {
  try {
    const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = req.body;
    const SMSMessage = require('../models/SMSMessage');
    
    logger.info(`Twilio status callback: ${MessageSid} - ${MessageStatus}`);
    
    // Update SMS message status
    await SMSMessage.updateStatus(MessageSid, MessageStatus, ErrorCode);
    
    // If failed, log the error
    if (MessageStatus === 'failed' || MessageStatus === 'undelivered') {
      logger.error(`SMS ${MessageSid} failed:`, {
        status: MessageStatus,
        errorCode: ErrorCode,
        errorMessage: ErrorMessage
      });
    }
    
    res.sendStatus(200);
  } catch (error) {
    logger.error('Twilio status callback error:', error);
    res.sendStatus(500);
  }
});

module.exports = router;
