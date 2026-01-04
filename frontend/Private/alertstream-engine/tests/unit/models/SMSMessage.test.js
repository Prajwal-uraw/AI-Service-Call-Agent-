const SMSMessage = require('../../../src/models/SMSMessage');
const { pool } = require('../../../src/config/database');

describe('SMSMessage Model', () => {
  let testUserId;
  let testWebsiteId;
  let testTriggerId;

  beforeAll(async () => {
    // Create test user
    const userResult = await pool.query(
      `INSERT INTO users (email, phone_number, monthly_sms_limit)
       VALUES ($1, $2, $3) RETURNING id`,
      [`test-sms-${Date.now()}@example.com`, '+1234567890', 100]
    );
    testUserId = userResult.rows[0].id;

    // Create test website
    const websiteResult = await pool.query(
      `INSERT INTO websites (user_id, domain, api_key, hmac_secret)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [testUserId, 'sms-test.com', 'test-key', 'test-secret']
    );
    testWebsiteId = websiteResult.rows[0].id;

    // Create test trigger
    const triggerResult = await pool.query(
      `INSERT INTO triggers (website_id, name, event_type, sms_template)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [testWebsiteId, 'Test Trigger', 'test_event', 'Test: {{data}}']
    );
    testTriggerId = triggerResult.rows[0].id;
  });

  afterAll(async () => {
    // Cleanup
    await pool.query('DELETE FROM sms_messages WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM triggers WHERE id = $1', [testTriggerId]);
    await pool.query('DELETE FROM websites WHERE id = $1', [testWebsiteId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    await pool.end();
  });

  describe('create', () => {
    it('should create a new SMS message', async () => {
      const smsData = {
        userId: testUserId,
        triggerId: testTriggerId,
        phoneNumber: '+15551234567',
        messageBody: 'Test message',
      };

      const sms = await SMSMessage.create(smsData);

      expect(sms).toBeDefined();
      expect(sms.id).toBeDefined();
      expect(sms.user_id).toBe(testUserId);
      expect(sms.phone_number).toBe('+15551234567');
      expect(sms.message_body).toBe('Test message');
      expect(sms.status).toBe('pending');
    });
  });

  describe('findByUserId', () => {
    it('should find all SMS messages for a user', async () => {
      await SMSMessage.create({
        userId: testUserId,
        phoneNumber: '+15551111111',
        messageBody: 'Message 1',
      });

      await SMSMessage.create({
        userId: testUserId,
        phoneNumber: '+15552222222',
        messageBody: 'Message 2',
      });

      const messages = await SMSMessage.findByUserId(testUserId);
      expect(messages.length).toBeGreaterThanOrEqual(2);
    });

    it('should support pagination', async () => {
      const messages = await SMSMessage.findByUserId(testUserId, 10, 0);
      expect(messages.length).toBeLessThanOrEqual(10);
    });
  });

  describe('updateStatus', () => {
    it('should update message status to sent', async () => {
      const sms = await SMSMessage.create({
        userId: testUserId,
        phoneNumber: '+15553333333',
        messageBody: 'Status test',
      });

      const updated = await SMSMessage.updateStatus(sms.id, 'sent', 'SM123456');
      expect(updated.status).toBe('sent');
      expect(updated.twilio_sid).toBe('SM123456');
      expect(updated.sent_at).toBeDefined();
    });

    it('should update message status to failed with error', async () => {
      const sms = await SMSMessage.create({
        userId: testUserId,
        phoneNumber: '+15554444444',
        messageBody: 'Fail test',
      });

      const updated = await SMSMessage.updateStatus(
        sms.id,
        'failed',
        null,
        'Invalid phone number'
      );
      expect(updated.status).toBe('failed');
      expect(updated.error_message).toBe('Invalid phone number');
    });
  });

  describe('markDelivered', () => {
    it('should mark message as delivered', async () => {
      const sms = await SMSMessage.create({
        userId: testUserId,
        phoneNumber: '+15555555555',
        messageBody: 'Delivery test',
      });

      await SMSMessage.updateStatus(sms.id, 'sent', 'SM789');
      const delivered = await SMSMessage.markDelivered(sms.id);

      expect(delivered.status).toBe('delivered');
      expect(delivered.delivered_at).toBeDefined();
    });
  });

  describe('getStats', () => {
    it('should return SMS statistics for user', async () => {
      const stats = await SMSMessage.getStats(testUserId);

      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(stats.sent).toBeGreaterThanOrEqual(0);
      expect(stats.failed).toBeGreaterThanOrEqual(0);
      expect(stats.pending).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getCostTotal', () => {
    it('should calculate total cost for user', async () => {
      const sms = await SMSMessage.create({
        userId: testUserId,
        phoneNumber: '+15556666666',
        messageBody: 'Cost test',
      });

      await pool.query(
        'UPDATE sms_messages SET cost = $1 WHERE id = $2',
        [0.0075, sms.id]
      );

      const total = await SMSMessage.getCostTotal(testUserId);
      expect(total).toBeGreaterThanOrEqual(0);
    });
  });
});
