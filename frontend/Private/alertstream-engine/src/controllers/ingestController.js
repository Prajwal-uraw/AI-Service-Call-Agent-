const { v4: uuidv4 } = require('uuid');
const Event = require('../models/Event');
const Trigger = require('../models/Trigger');
const Website = require('../models/Website');
const { enqueueSMSJob } = require('../services/queueService');
const logger = require('../utils/logger');

class IngestController {
  async handleEvent(req, res) {
    try {
      const { website, body } = req;
      const { event_type, metadata } = body;
      
      // 1. Store event for audit
      const event = await Event.create({
        id: uuidv4(),
        website_id: website.id,
        event_type,
        payload: metadata,
        ingested_at: new Date()
      });
      
      // 2. Find matching triggers
      const triggers = await Trigger.findActiveByWebsiteAndType(
        website.id, 
        event_type
      );
      
      if (triggers.length > 0) {
        // 3. For each trigger, queue SMS job
        for (const trigger of triggers) {
          await enqueueSMSJob({
            trigger_id: trigger.id,
            event_id: event.id,
            website_id: website.id,
            event_type,
            metadata
          });
        }
        
        logger.info(`Ingested event ${event.id} for website ${website.domain}`, {
          event_type,
          triggers_matched: triggers.length
        });
      }
      
      // 4. Respond immediately (async processing)
      res.status(202).json({ 
        success: true, 
        event_id: event.id,
        triggers_matched: triggers.length 
      });
      
    } catch (error) {
      logger.error('Error ingesting event:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to process event' 
      });
    }
  }
  
  async handleTestEvent(req, res) {
    // Simplified version for testing
    res.status(200).json({ 
      success: true, 
      message: 'Test event received',
      payload: req.body
    });
  }
}

module.exports = new IngestController();
