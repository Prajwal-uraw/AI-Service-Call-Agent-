const request = require('supertest');
const app = require('../../../src/app');
const crypto = require('crypto');

describe('Ingest API Integration Tests', () => {
  let testWebsite;
  let testUser;

  beforeAll(async () => {
    // Create test user and website
    testUser = await global.testHelpers.createTestUser();
    testWebsite = await global.testHelpers.createTestWebsite();
  });

  describe('POST /api/v1/ingest', () => {
    test('should accept valid event with HMAC signature', async () => {
      const eventData = {
        event_type: 'form_submit',
        metadata: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      const timestamp = Math.floor(Date.now() / 1000);
      const signature = crypto
        .createHmac('sha256', testWebsite.hmac_secret)
        .update(`${timestamp}:${JSON.stringify(eventData)}`)
        .digest('hex');

      const response = await request(app)
        .post('/api/v1/ingest')
        .set('X-API-Key', testWebsite.api_key)
        .set('X-Signature', signature)
        .set('X-Timestamp', timestamp.toString())
        .send(eventData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.event_id).toBeDefined();
    });

    test('should reject request without API key', async () => {
      const eventData = {
        event_type: 'form_submit',
        metadata: {},
      };

      const response = await request(app)
        .post('/api/v1/ingest')
        .send(eventData);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('authentication');
    });

    test('should reject request with invalid signature', async () => {
      const eventData = {
        event_type: 'form_submit',
        metadata: {},
      };

      const timestamp = Math.floor(Date.now() / 1000);
      const invalidSignature = 'invalid-signature';

      const response = await request(app)
        .post('/api/v1/ingest')
        .set('X-API-Key', testWebsite.api_key)
        .set('X-Signature', invalidSignature)
        .set('X-Timestamp', timestamp.toString())
        .send(eventData);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('signature');
    });

    test('should reject request with expired timestamp', async () => {
      const eventData = {
        event_type: 'form_submit',
        metadata: {},
      };

      // Timestamp from 10 minutes ago (expired)
      const timestamp = Math.floor(Date.now() / 1000) - 600;
      const signature = crypto
        .createHmac('sha256', testWebsite.hmac_secret)
        .update(`${timestamp}:${JSON.stringify(eventData)}`)
        .digest('hex');

      const response = await request(app)
        .post('/api/v1/ingest')
        .set('X-API-Key', testWebsite.api_key)
        .set('X-Signature', signature)
        .set('X-Timestamp', timestamp.toString())
        .send(eventData);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('timestamp');
    });

    test('should validate event_type is present', async () => {
      const eventData = {
        metadata: { name: 'Test' },
      };

      const timestamp = Math.floor(Date.now() / 1000);
      const signature = crypto
        .createHmac('sha256', testWebsite.hmac_secret)
        .update(`${timestamp}:${JSON.stringify(eventData)}`)
        .digest('hex');

      const response = await request(app)
        .post('/api/v1/ingest')
        .set('X-API-Key', testWebsite.api_key)
        .set('X-Signature', signature)
        .set('X-Timestamp', timestamp.toString())
        .send(eventData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('event_type');
    });

    test('should handle rate limiting', async () => {
      const eventData = {
        event_type: 'test_event',
        metadata: {},
      };

      // Send 100 requests rapidly
      const requests = Array(100).fill(null).map(() => {
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = crypto
          .createHmac('sha256', testWebsite.hmac_secret)
          .update(`${timestamp}:${JSON.stringify(eventData)}`)
          .digest('hex');

        return request(app)
          .post('/api/v1/ingest')
          .set('X-API-Key', testWebsite.api_key)
          .set('X-Signature', signature)
          .set('X-Timestamp', timestamp.toString())
          .send(eventData);
      });

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);

      expect(rateLimited).toBe(true);
    });
  });
});
