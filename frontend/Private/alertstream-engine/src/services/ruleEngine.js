const User = require('../models/User');
const Website = require('../models/Website');
const Trigger = require('../models/Trigger');
const { createSMSBody } = require('./smsService');
const logger = require('../utils/logger');

class RuleEngine {
  async processTriggerJob(job) {
    const { 
      trigger_id, 
      event_id, 
      website_id, 
      event_type, 
      metadata 
    } = job.data;
    
    try {
      // 1. Get website and user info
      const website = await Website.findById(website_id);
      if (!website) {
        throw new Error(`Website ${website_id} not found`);
      }
      
      const user = await User.findById(website.user_id);
      if (!user) {
        throw new Error(`User for website ${website_id} not found`);
      }
      
      // 2. Check user quota
      const hasQuota = await User.hasQuota(user.id);
      if (!hasQuota) {
        logger.warn(`User ${user.id} has exceeded SMS quota`, {
          usage: user.current_sms_usage,
          limit: user.monthly_sms_limit
        });
        return { skipped: 'quota_exceeded' };
      }
      
      // 3. Get trigger details
      const trigger = await Trigger.findById(trigger_id);
      if (!trigger || !trigger.is_active) {
        throw new Error(`Trigger ${trigger_id} not active`);
      }
      
      // 4. Create SMS body based on event type
      const smsBody = this.createMessage(event_type, metadata, website);
      
      // 5. Return SMS payload
      return {
        to: user.phone_number,
        body: smsBody,
        user_id: user.id,
        trigger_id: trigger_id,
        event_id: event_id,
        metadata: {
          event_type,
          website_domain: website.domain
        }
      };
      
    } catch (error) {
      logger.error('Rule engine processing error:', error);
      throw error;
    }
  }
  
  createMessage(eventType, metadata, website) {
    const timestamp = new Date().toLocaleTimeString();
    const domain = website.domain.replace('https://', '').replace('http://', '');
    
    const templates = {
      form_submit: `📝 New form submission on ${domain} at ${timestamp}\nFrom: ${metadata.name || 'Unknown'}\nMessage: ${metadata.message?.substring(0, 50) || 'No message'}...`,
      
      order_created: `🛒 New order on ${domain} at ${timestamp}\nOrder #${metadata.order_id}\nTotal: $${metadata.total || '0.00'}\nItems: ${metadata.item_count || 1}`,
      
      user_signup: `👤 New user signup on ${domain} at ${timestamp}\nEmail: ${metadata.email}\nUsername: ${metadata.username || 'N/A'}`,
      
      custom: `🔔 Event on ${domain} at ${timestamp}\nType: ${metadata.event_name || eventType}\nDetails: ${JSON.stringify(metadata).substring(0, 100)}...`
    };
    
    return templates[eventType] || templates.custom;
  }
}

module.exports = new RuleEngine();
