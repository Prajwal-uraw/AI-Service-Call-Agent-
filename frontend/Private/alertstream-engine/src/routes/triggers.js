const express = require('express');
const router = express.Router();
const Trigger = require('../models/Trigger');
const Website = require('../models/Website');
const auth = require('../middleware/auth');
const { validateTrigger } = require('../middleware/validators');
const logger = require('../utils/logger');

// Get all triggers for a website
router.get('/', auth.hmacAuth, async (req, res) => {
  try {
    const triggers = await Trigger.findByWebsite(req.website.id);
    res.json({ success: true, triggers });
  } catch (error) {
    logger.error('Error fetching triggers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch triggers' });
  }
});

// Create a new trigger
router.post('/', auth.hmacAuth, validateTrigger, async (req, res) => {
  try {
    const { event_type } = req.body;
    
    const trigger = await Trigger.create({
      websiteId: req.website.id,
      eventType: event_type,
      isActive: true
    });
    
    logger.info(`Trigger created for website ${req.website.domain}`, {
      trigger_id: trigger.id,
      event_type
    });
    
    res.status(201).json({ success: true, trigger });
  } catch (error) {
    logger.error('Error creating trigger:', error);
    res.status(500).json({ success: false, error: 'Failed to create trigger' });
  }
});

// Update trigger status
router.patch('/:triggerId', auth.hmacAuth, async (req, res) => {
  try {
    const { triggerId } = req.params;
    const { is_active } = req.body;
    
    const trigger = await Trigger.updateStatus(triggerId, is_active);
    
    if (!trigger) {
      return res.status(404).json({ success: false, error: 'Trigger not found' });
    }
    
    logger.info(`Trigger ${triggerId} status updated to ${is_active}`);
    
    res.json({ success: true, trigger });
  } catch (error) {
    logger.error('Error updating trigger:', error);
    res.status(500).json({ success: false, error: 'Failed to update trigger' });
  }
});

// Delete a trigger
router.delete('/:triggerId', auth.hmacAuth, async (req, res) => {
  try {
    const { triggerId } = req.params;
    
    await Trigger.delete(triggerId);
    
    logger.info(`Trigger ${triggerId} deleted`);
    
    res.json({ success: true, message: 'Trigger deleted' });
  } catch (error) {
    logger.error('Error deleting trigger:', error);
    res.status(500).json({ success: false, error: 'Failed to delete trigger' });
  }
});

module.exports = router;
