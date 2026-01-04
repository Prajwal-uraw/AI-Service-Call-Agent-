const ruleEngine = require('../../../src/services/ruleEngine');

describe('Rule Engine Service', () => {
  describe('processEvent', () => {
    test('should match trigger and queue SMS', async () => {
      const event = {
        event_type: 'form_submit',
        metadata: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      const website = {
        id: 'website-1',
        user_id: 'user-1',
        domain: 'example.com',
      };

      const result = await ruleEngine.processEvent(event, website);

      expect(result).toBeDefined();
      expect(result.matched).toBe(true);
      expect(result.triggers_matched).toBeGreaterThan(0);
    });

    test('should not match when no triggers exist', async () => {
      const event = {
        event_type: 'unknown_event',
        metadata: {},
      };

      const website = {
        id: 'website-2',
        user_id: 'user-2',
        domain: 'example2.com',
      };

      const result = await ruleEngine.processEvent(event, website);

      expect(result.matched).toBe(false);
      expect(result.triggers_matched).toBe(0);
    });

    test('should check user quota before queueing', async () => {
      const event = {
        event_type: 'form_submit',
        metadata: { name: 'Test' },
      };

      const website = {
        id: 'website-3',
        user_id: 'user-no-quota',
        domain: 'example3.com',
      };

      // Mock user with no quota
      jest.spyOn(require('../../../src/models/User'), 'hasQuota')
        .mockResolvedValue(false);

      const result = await ruleEngine.processEvent(event, website);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('quota');
    });
  });

  describe('renderTemplate', () => {
    test('should render template with metadata', () => {
      const template = 'New submission from {{name}} ({{email}})';
      const metadata = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const rendered = ruleEngine.renderTemplate(template, metadata);

      expect(rendered).toBe('New submission from John Doe (john@example.com)');
    });

    test('should handle missing metadata fields', () => {
      const template = 'Hello {{name}}, your order {{order_id}} is ready';
      const metadata = {
        name: 'Jane',
      };

      const rendered = ruleEngine.renderTemplate(template, metadata);

      expect(rendered).toContain('Jane');
      expect(rendered).toContain('{{order_id}}'); // Unchanged
    });

    test('should handle empty metadata', () => {
      const template = 'Static message';
      const metadata = {};

      const rendered = ruleEngine.renderTemplate(template, metadata);

      expect(rendered).toBe('Static message');
    });
  });

  describe('matchConditions', () => {
    test('should match simple equality condition', () => {
      const conditions = [
        { field: 'amount', operator: 'equals', value: '100' },
      ];

      const metadata = {
        amount: '100',
      };

      const matches = ruleEngine.matchConditions(conditions, metadata);

      expect(matches).toBe(true);
    });

    test('should match greater_than condition', () => {
      const conditions = [
        { field: 'amount', operator: 'greater_than', value: '50' },
      ];

      const metadata = {
        amount: '100',
      };

      const matches = ruleEngine.matchConditions(conditions, metadata);

      expect(matches).toBe(true);
    });

    test('should match contains condition', () => {
      const conditions = [
        { field: 'message', operator: 'contains', value: 'urgent' },
      ];

      const metadata = {
        message: 'This is an urgent request',
      };

      const matches = ruleEngine.matchConditions(conditions, metadata);

      expect(matches).toBe(true);
    });

    test('should fail when condition not met', () => {
      const conditions = [
        { field: 'status', operator: 'equals', value: 'approved' },
      ];

      const metadata = {
        status: 'pending',
      };

      const matches = ruleEngine.matchConditions(conditions, metadata);

      expect(matches).toBe(false);
    });

    test('should match all conditions (AND logic)', () => {
      const conditions = [
        { field: 'amount', operator: 'greater_than', value: '50' },
        { field: 'status', operator: 'equals', value: 'paid' },
      ];

      const metadata = {
        amount: '100',
        status: 'paid',
      };

      const matches = ruleEngine.matchConditions(conditions, metadata);

      expect(matches).toBe(true);
    });
  });
});
