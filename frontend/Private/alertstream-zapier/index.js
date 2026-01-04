// Zapier Integration - AlertStream App
const ZapierApp = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  beforeRequest: [
    (request, z, bundle) => {
      request.headers['X-API-Key'] = bundle.authData.api_key;
      request.headers['User-Agent'] = `AlertStream-Zapier/${ZapierApp.version}`;
      return request;
    }
  ],

  afterResponse: [
    (response, z, bundle) => {
      if (response.status === 401) {
        throw new z.errors.Error(
          'Invalid API key',
          'AuthenticationError',
          response.status
        );
      }
      return response;
    }
  ],

  authentication: {
    type: 'custom',
    fields: [
      {
        key: 'api_key',
        type: 'string',
        required: true,
        helpText: 'Your AlertStream API key'
      },
      {
        key: 'api_url',
        type: 'string',
        required: false,
        default: 'https://api.alertstream.com',
        helpText: 'AlertStream API URL (optional)'
      }
    ],
    test: (z, bundle) => {
      return z.request({
        url: `${bundle.authData.api_url || 'https://api.alertstream.com'}/v1/health`,
        method: 'GET',
        headers: {
          'X-API-Key': bundle.authData.api_key
        }
      });
    }
  },

  triggers: {
    // Trigger: New SMS Alert Trigger
    new_trigger: {
      key: 'new_trigger',
      noun: 'Trigger',
      display: {
        label: 'New Trigger Created',
        description: 'When a new trigger is created in AlertStream'
      },
      operation: {
        perform: {
          url: '{{bundle.authData.api_url}}/v1/triggers',
          method: 'GET',
          params: {
            sort: 'created_at',
            order: 'desc'
          }
        },
        sample: {
          id: 'trig_123',
          website_id: 'site_123',
          event_type: 'form_submit',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z'
        }
      }
    },

    // Trigger: SMS Sent
    sms_sent: {
      key: 'sms_sent',
      noun: 'SMS',
      display: {
        label: 'SMS Sent',
        description: 'When an SMS is successfully sent'
      },
      operation: {
        perform: {
          url: '{{bundle.authData.api_url}}/v1/sms',
          method: 'GET',
          params: {
            status: 'sent',
            sort: 'sent_at',
            order: 'desc'
          }
        },
        sample: {
          id: 'sms_123',
          trigger_id: 'trig_123',
          to_number: '+1234567890',
          body: 'New form submission on example.com',
          status: 'sent',
          sent_at: '2024-01-01T00:00:00Z'
        }
      }
    }
  },

  creates: {
    // Create: Send SMS
    send_sms: {
      key: 'send_sms',
      noun: 'SMS',
      display: {
        label: 'Send SMS',
        description: 'Send an SMS through AlertStream'
      },
      operation: {
        inputFields: [
          {
            key: 'to',
            label: 'Phone Number',
            type: 'string',
            required: true,
            helpText: 'Phone number in E.164 format (+1234567890)'
          },
          {
            key: 'body',
            label: 'Message',
            type: 'text',
            required: true,
            helpText: 'SMS message body (max 1600 characters)'
          },
          {
            key: 'website_id',
            label: 'Website ID',
            type: 'string',
            required: false,
            helpText: 'Optional: Associate with a specific website'
          }
        ],
        perform: (z, bundle) => {
          return z.request({
            url: `${bundle.authData.api_url}/v1/sms/send`,
            method: 'POST',
            body: {
              to: bundle.inputData.to,
              body: bundle.inputData.body,
              website_id: bundle.inputData.website_id
            }
          });
        },
        sample: {
          id: 'sms_123',
          to: '+1234567890',
          body: 'Test message',
          status: 'queued',
          created_at: '2024-01-01T00:00:00Z'
        }
      }
    },

    // Create: Create Trigger
    create_trigger: {
      key: 'create_trigger',
      noun: 'Trigger',
      display: {
        label: 'Create Trigger',
        description: 'Create a new SMS trigger'
      },
      operation: {
        inputFields: [
          {
            key: 'website_id',
            label: 'Website ID',
            type: 'string',
            required: true,
            helpText: 'The website to create the trigger for'
          },
          {
            key: 'event_type',
            label: 'Event Type',
            type: 'string',
            required: true,
            choices: {
              'form_submit': 'Form Submission',
              'order_created': 'Order Created',
              'user_signup': 'User Signup',
              'page_view': 'Page View',
              'custom': 'Custom Event'
            },
            default: 'form_submit'
          },
          {
            key: 'custom_event_name',
            label: 'Custom Event Name',
            type: 'string',
            required: false,
            helpText: 'Required if event_type is "custom"'
          }
        ],
        perform: (z, bundle) => {
          const payload = {
            website_id: bundle.inputData.website_id,
            event_type: bundle.inputData.event_type,
            is_active: true
          };

          if (bundle.inputData.event_type === 'custom' && bundle.inputData.custom_event_name) {
            payload.event_type = `custom:${bundle.inputData.custom_event_name}`;
          }

          return z.request({
            url: `${bundle.authData.api_url}/v1/triggers`,
            method: 'POST',
            body: payload
          });
        },
        sample: {
          id: 'trig_123',
          website_id: 'site_123',
          event_type: 'form_submit',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z'
        }
      }
    }
  },

  searches: {
    // Search: Find Website
    find_website: {
      key: 'find_website',
      noun: 'Website',
      display: {
        label: 'Find Website',
        description: 'Find a website by domain'
      },
      operation: {
        inputFields: [
          {
            key: 'domain',
            label: 'Domain',
            type: 'string',
            required: true,
            helpText: 'Website domain (example.com)'
          }
        ],
        perform: (z, bundle) => {
          return z.request({
            url: `${bundle.authData.api_url}/v1/websites`,
            method: 'GET',
            params: {
              domain: bundle.inputData.domain
            }
          });
        }
      }
    }
  }
};

module.exports = ZapierApp;
