const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AlertStream API',
      version: '1.0.0',
      description: 'SMS notification platform API for receiving instant text alerts for critical website events',
      contact: {
        name: 'AlertStream Support',
        email: 'support@alertstream.com',
        url: 'https://alertstream.com/support',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
      {
        url: 'https://api.alertstream.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for website authentication',
        },
        HmacAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Signature',
          description: 'HMAC-SHA256 signature for request verification',
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for user authentication',
        },
      },
      schemas: {
        Event: {
          type: 'object',
          required: ['event_type'],
          properties: {
            event_type: {
              type: 'string',
              description: 'Type of event',
              example: 'form_submit',
            },
            metadata: {
              type: 'object',
              description: 'Event metadata',
              additionalProperties: true,
              example: {
                name: 'John Doe',
                email: 'john@example.com',
              },
            },
          },
        },
        Website: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            domain: {
              type: 'string',
              example: 'example.com',
            },
            api_key: {
              type: 'string',
            },
            is_active: {
              type: 'boolean',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Trigger: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            website_id: {
              type: 'string',
              format: 'uuid',
            },
            event_type: {
              type: 'string',
              example: 'form_submit',
            },
            conditions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  operator: { type: 'string', enum: ['equals', 'contains', 'greater_than', 'less_than'] },
                  value: { type: 'string' },
                },
              },
            },
            sms_template: {
              type: 'string',
              example: 'New form submission from {{name}}',
            },
            is_active: {
              type: 'boolean',
            },
          },
        },
        SMSMessage: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            user_id: {
              type: 'string',
              format: 'uuid',
            },
            trigger_id: {
              type: 'string',
              format: 'uuid',
            },
            phone_number: {
              type: 'string',
              example: '+15551234567',
            },
            message_body: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['pending', 'sent', 'delivered', 'failed'],
            },
            twilio_sid: {
              type: 'string',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            code: {
              type: 'string',
              description: 'Error code',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Events',
        description: 'Event ingestion endpoints',
      },
      {
        name: 'Websites',
        description: 'Website management',
      },
      {
        name: 'Triggers',
        description: 'Trigger configuration',
      },
      {
        name: 'SMS',
        description: 'SMS message history',
      },
      {
        name: 'Auth',
        description: 'Authentication',
      },
      {
        name: 'Webhooks',
        description: 'Webhook endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/app.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
