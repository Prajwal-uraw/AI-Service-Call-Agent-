const Website = require('../../../src/models/Website');
const { pool } = require('../../../src/config/database');
const crypto = require('crypto');

describe('Website Model', () => {
  let testUserId;
  let testWebsiteId;

  beforeAll(async () => {
    // Create a test user
    const result = await pool.query(
      `INSERT INTO users (email, phone_number, monthly_sms_limit)
       VALUES ($1, $2, $3) RETURNING id`,
      [`test-website-${Date.now()}@example.com`, '+1234567890', 100]
    );
    testUserId = result.rows[0].id;
  });

  afterAll(async () => {
    // Cleanup
    await pool.query('DELETE FROM websites WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    await pool.end();
  });

  describe('create', () => {
    it('should create a new website with API keys', async () => {
      const websiteData = {
        userId: testUserId,
        domain: 'example.com',
      };

      const website = await Website.create(websiteData);
      testWebsiteId = website.id;

      expect(website).toBeDefined();
      expect(website.id).toBeDefined();
      expect(website.user_id).toBe(testUserId);
      expect(website.domain).toBe('example.com');
      expect(website.api_key).toBeDefined();
      expect(website.hmac_secret).toBeDefined();
      expect(website.is_active).toBe(true);
    });

    it('should create website with allowed domains', async () => {
      const websiteData = {
        userId: testUserId,
        domain: 'test.com',
        allowedDomains: ['test.com', 'www.test.com'],
      };

      const website = await Website.create(websiteData);
      expect(website.allowed_domains).toEqual(['test.com', 'www.test.com']);
    });
  });

  describe('findByApiKey', () => {
    it('should find website by API key', async () => {
      const created = await Website.create({
        userId: testUserId,
        domain: 'findme.com',
      });

      const found = await Website.findByApiKey(created.api_key);
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.domain).toBe('findme.com');
    });

    it('should return undefined for invalid API key', async () => {
      const found = await Website.findByApiKey('invalid-key-12345');
      expect(found).toBeUndefined();
    });
  });

  describe('findByUserId', () => {
    it('should find all websites for a user', async () => {
      await Website.create({ userId: testUserId, domain: 'site1.com' });
      await Website.create({ userId: testUserId, domain: 'site2.com' });

      const websites = await Website.findByUserId(testUserId);
      expect(websites.length).toBeGreaterThanOrEqual(2);
      expect(websites.every(w => w.user_id === testUserId)).toBe(true);
    });
  });

  describe('verifyHmacSignature', () => {
    it('should verify valid HMAC signature', async () => {
      const website = await Website.create({
        userId: testUserId,
        domain: 'hmac-test.com',
      });

      const payload = JSON.stringify({ event_type: 'test', data: 'value' });
      const timestamp = Date.now().toString();
      const message = `${payload}${timestamp}`;
      const signature = crypto
        .createHmac('sha256', website.hmac_secret)
        .update(message)
        .digest('hex');

      const isValid = await Website.verifyHmacSignature(
        website.id,
        payload,
        signature,
        timestamp
      );
      expect(isValid).toBe(true);
    });

    it('should reject invalid HMAC signature', async () => {
      const website = await Website.create({
        userId: testUserId,
        domain: 'hmac-test2.com',
      });

      const payload = JSON.stringify({ event_type: 'test' });
      const timestamp = Date.now().toString();
      const invalidSignature = 'invalid-signature-hash';

      const isValid = await Website.verifyHmacSignature(
        website.id,
        payload,
        invalidSignature,
        timestamp
      );
      expect(isValid).toBe(false);
    });
  });

  describe('regenerateApiKey', () => {
    it('should regenerate API key', async () => {
      const website = await Website.create({
        userId: testUserId,
        domain: 'regen-test.com',
      });

      const oldApiKey = website.api_key;
      const updated = await Website.regenerateApiKey(website.id);

      expect(updated.api_key).toBeDefined();
      expect(updated.api_key).not.toBe(oldApiKey);
    });
  });

  describe('deactivate', () => {
    it('should deactivate website', async () => {
      const website = await Website.create({
        userId: testUserId,
        domain: 'deactivate-test.com',
      });

      await Website.deactivate(website.id);
      const updated = await Website.findById(website.id);

      expect(updated.is_active).toBe(false);
    });
  });
});
