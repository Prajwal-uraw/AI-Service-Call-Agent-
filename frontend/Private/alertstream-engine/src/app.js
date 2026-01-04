const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const ingestRouter = require('./routes/ingest');
const triggersRouter = require('./routes/triggers');
const webhooksRouter = require('./routes/webhooks');
const authRouter = require('./routes/auth');
const jsEventsRouter = require('./routes/jsEvents');
const zapierRouter = require('./routes/zapier');
const websitesRouter = require('./routes/websites');
const billingRouter = require('./routes/billing');
const { livenessEndpoint, readinessEndpoint, healthEndpoint } = require('./health');
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AlertStream Engine',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: {
        auth: '/api/v1/auth',
        websites: '/api/v1/websites',
        triggers: '/api/v1/triggers',
        ingest: '/api/v1/ingest',
        webhooks: '/api/v1/webhooks',
        billing: '/api/v1/billing',
        jsEvents: '/api/v1/js-events',
        zapier: '/api/v1/zapier'
      },
      docs: '/api-docs'
    }
  });
});

// Health check endpoints
app.get('/health', healthEndpoint);
app.get('/health/live', livenessEndpoint);
app.get('/health/ready', readinessEndpoint);

// API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/websites', websitesRouter);
app.use('/api/v1/billing', billingRouter);
app.use('/api/v1/ingest', ingestRouter);
app.use('/api/v1/triggers', triggersRouter);
app.use('/api/v1/webhooks', webhooksRouter);
app.use('/api/v1/js-events', jsEventsRouter);
app.use('/api/v1/zapier', zapierRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
});

module.exports = app;
