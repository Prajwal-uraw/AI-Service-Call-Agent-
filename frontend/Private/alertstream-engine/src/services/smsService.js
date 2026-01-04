const twilio = require('twilio');
const SMSMessage = require('../models/SMSMessage');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class SMSService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  
  async send(payload) {
    const { to, body, user_id, trigger_id, event_id, metadata } = payload;
    let smsRecord = null;
    
    try {
      // Create SMS record
      smsRecord = await SMSMessage.create({
        id: uuidv4(),
        user_id,
        trigger_id,
        to_number: to,
        body,
        status: 'queued'
      });
      
      // Send via Twilio
      const message = await this.client.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
      });
      
      // Update record
      await SMSMessage.updateStatus(smsRecord.id, 'sent', message.sid);
      
      // Increment user usage
      await User.incrementUsage(user_id);
      
      logger.info(`SMS sent successfully: ${message.sid}`, {
        to: to,
        user_id,
        message_length: body.length
      });
      
      return {
        success: true,
        message_id: message.sid,
        sms_record_id: smsRecord.id
      };
      
    } catch (error) {
      logger.error('SMS sending failed:', error);
      
      // Update record to failed
      if (smsRecord) {
        await SMSMessage.updateStatus(smsRecord.id, 'failed');
      }
      
      throw error;
    }
  }
  
  async sendTest(to) {
    const testBody = `✅ Test SMS from AlertStream\nTime: ${new Date().toLocaleString()}\nThis confirms your SMS alerts are working.`;
    
    try {
      const message = await this.client.messages.create({
        body: testBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
      });
      
      return { success: true, sid: message.sid };
    } catch (error) {
      logger.error('Test SMS failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SMSService();
