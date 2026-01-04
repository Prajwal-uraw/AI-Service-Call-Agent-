const promClient = require('prom-client');

// Create a Registry
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

const smsCounter = new promClient.Counter({
  name: 'sms_sent_total',
  help: 'Total number of SMS messages sent',
  labelNames: ['status', 'user_id'],
});

const smsDeliveryDuration = new promClient.Histogram({
  name: 'sms_delivery_duration_seconds',
  help: 'Time taken to deliver SMS',
  labelNames: ['status'],
  buckets: [1, 5, 10, 30, 60],
});

const queueDepth = new promClient.Gauge({
  name: 'queue_depth',
  help: 'Current depth of SMS queue',
  labelNames: ['queue_name'],
});

const queueProcessingTime = new promClient.Histogram({
  name: 'queue_processing_time_seconds',
  help: 'Time taken to process queue jobs',
  labelNames: ['queue_name', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

const activeUsers = new promClient.Gauge({
  name: 'active_users_total',
  help: 'Number of active users',
  labelNames: ['plan'],
});

const apiErrors = new promClient.Counter({
  name: 'api_errors_total',
  help: 'Total number of API errors',
  labelNames: ['endpoint', 'error_type'],
});

const triggerMatches = new promClient.Counter({
  name: 'trigger_matches_total',
  help: 'Total number of trigger matches',
  labelNames: ['event_type', 'website_id'],
});

const webhookDelivery = new promClient.Counter({
  name: 'webhook_delivery_total',
  help: 'Total webhook deliveries',
  labelNames: ['status', 'provider'],
});

// Register all metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(smsCounter);
register.registerMetric(smsDeliveryDuration);
register.registerMetric(queueDepth);
register.registerMetric(queueProcessingTime);
register.registerMetric(activeUsers);
register.registerMetric(apiErrors);
register.registerMetric(triggerMatches);
register.registerMetric(webhookDelivery);

// Middleware to track HTTP requests
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  
  next();
};

// Helper functions
const recordSMS = (status, userId) => {
  smsCounter.labels(status, userId).inc();
};

const recordSMSDelivery = (duration, status) => {
  smsDeliveryDuration.labels(status).observe(duration);
};

const updateQueueDepth = (queueName, depth) => {
  queueDepth.labels(queueName).set(depth);
};

const recordQueueProcessing = (queueName, duration, status) => {
  queueProcessingTime.labels(queueName, status).observe(duration);
};

const updateActiveUsers = (plan, count) => {
  activeUsers.labels(plan).set(count);
};

const recordError = (endpoint, errorType) => {
  apiErrors.labels(endpoint, errorType).inc();
};

const recordTriggerMatch = (eventType, websiteId) => {
  triggerMatches.labels(eventType, websiteId).inc();
};

const recordWebhookDelivery = (status, provider) => {
  webhookDelivery.labels(status, provider).inc();
};

// Metrics endpoint handler
const metricsHandler = async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

module.exports = {
  register,
  metricsMiddleware,
  metricsHandler,
  recordSMS,
  recordSMSDelivery,
  updateQueueDepth,
  recordQueueProcessing,
  updateActiveUsers,
  recordError,
  recordTriggerMatch,
  recordWebhookDelivery,
};
