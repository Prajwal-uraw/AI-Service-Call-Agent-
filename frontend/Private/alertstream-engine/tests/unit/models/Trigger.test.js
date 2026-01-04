const Trigger = require('../../../src/models/Trigger');
const { pool } = require('../../../src/config/database');

describe('Trigger Model', () => {
  let testUserId;
  let testWebsiteId;

  beforeAll(async () => {
    // Create test user
    const userResult = await pool.query(
      `INSERT INTO users (email, phone_number, monthly_sms_limit)
       VALUES ($1, $2, $3) RETURNING id`,
      [`test-trigger-${Date.now()}@example.com`, '+1234567890', 100]
    );
    testUserId = userResult.rows[0].id;

    // Create test website
    const websiteResult = await pool.query(
      `INSERT INTO websites (user_id, domain, api_key, hmac_secret)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [testUserId, 'trigger-test.com', 'test-api-key', 'test-secret']
    );
    testWebsiteId = websiteResult.rows[0].id;
  });

  afterAll(async () => {
    // Cleanup
    await pool.query('DELETE FROM triggers WHERE website_id = $1', [testWebsiteId]);
    await pool.query('DELETE FROM websites WHERE id = $1', [testWebsiteId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    await pool.end();
  });

  describe('create', () => {
    it('should create a new trigger', async () => {
      const triggerData = {
        websiteId: testWebsiteId,
        name: 'New Lead Alert',
        eventType: 'lead_created',
        conditions: [{ field: 'value', operator: 'greater_than', value: 1000 }],
        smsTemplate: 'New lead: {{name}} - {{email}}',
      };

      const trigger = await Trigger.create(triggerData);

      expect(trigger).toBeDefined();
      expect(trigger.id).toBeDefined();
      expect(trigger.website_id).toBe(testWebsiteId);
      expect(trigger.name).toBe('New Lead Alert');
      expect(trigger.event_type).toBe('lead_created');
      expect(trigger.is_active).toBe(true);
    });

    it('should create trigger without conditions', async () => {
      const triggerData = {
        websiteId: testWebsiteId,
        name: 'Simple Alert',
        eventType: 'form_submit',
        smsTemplate: 'Form submitted!',
      };

      const trigger = await Trigger.create(triggerData);
      expect(trigger.conditions).toEqual([]);
    });
  });

  describe('findByWebsiteId', () => {
    it('should find all triggers for a website', async () => {
      await Trigger.create({
        websiteId: testWebsiteId,
        name: 'Trigger 1',
        eventType: 'event1',
        smsTemplate: 'Template 1',
      });

      await Trigger.create({
        websiteId: testWebsiteId,
        name: 'Trigger 2',
        eventType: 'event2',
        smsTemplate: 'Template 2',
      });

      const triggers = await Trigger.findByWebsiteId(testWebsiteId);
      expect(triggers.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('findActiveByEventType', () => {
    it('should find active triggers by event type', async () => {
      await Trigger.create({
        websiteId: testWebsiteId,
        name: 'Purchase Alert',
        eventType: 'purchase',
        smsTemplate: 'New purchase!',
      });

      const triggers = await Trigger.findActiveByEventType(testWebsiteId, 'purchase');
      expect(triggers.length).toBeGreaterThan(0);
      expect(triggers.every(t => t.event_type === 'purchase')).toBe(true);
      expect(triggers.every(t => t.is_active === true)).toBe(true);
    });
  });

  describe('update', () => {
    it('should update trigger properties', async () => {
      const trigger = await Trigger.create({
        websiteId: testWebsiteId,
        name: 'Original Name',
        eventType: 'test_event',
        smsTemplate: 'Original template',
      });

      const updated = await Trigger.update(trigger.id, {
        name: 'Updated Name',
        smsTemplate: 'Updated template: {{data}}',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.sms_template).toBe('Updated template: {{data}}');
    });
  });

  describe('deactivate', () => {
    it('should deactivate trigger', async () => {
      const trigger = await Trigger.create({
        websiteId: testWebsiteId,
        name: 'To Deactivate',
        eventType: 'test',
        smsTemplate: 'Test',
      });

      await Trigger.deactivate(trigger.id);
      const updated = await Trigger.findById(trigger.id);

      expect(updated.is_active).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete trigger', async () => {
      const trigger = await Trigger.create({
        websiteId: testWebsiteId,
        name: 'To Delete',
        eventType: 'test',
        smsTemplate: 'Test',
      });

      await Trigger.delete(trigger.id);
      const deleted = await Trigger.findById(trigger.id);

      expect(deleted).toBeUndefined();
    });
  });
});
