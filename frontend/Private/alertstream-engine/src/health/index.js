// Comprehensive health checks
const logger = require('../utils/logger');

class HealthChecker {
  constructor() {
    this.checks = new Map();
  }

  registerReadinessCheck(name, checkFn) {
    this.checks.set(name, { type: 'readiness', fn: checkFn });
  }

  registerLivenessCheck(name, checkFn) {
    this.checks.set(name, { type: 'liveness', fn: checkFn });
  }

  async runChecks(type = 'all') {
    const results = {};
    let allHealthy = true;

    for (const [name, check] of this.checks) {
      if (type !== 'all' && check.type !== type) continue;

      try {
        const result = await check.fn();
        results[name] = { status: 'healthy', ...result };
      } catch (err) {
        results[name] = { status: 'unhealthy', error: err.message };
        allHealthy = false;
      }
    }

    return { healthy: allHealthy, checks: results };
  }
}

const healthcheck = new HealthChecker();

// Add checks
healthcheck.registerReadinessCheck('database', async () => {
  const db = require('../config/database');
  try {
    await db.query('SELECT 1');
    return { status: 'healthy' };
  } catch (err) {
    throw new Error(`Database unreachable: ${err.message}`);
  }
});

healthcheck.registerReadinessCheck('redis', async () => {
  try {
    const redis = require('../config/redis');
    if (redis && redis.ping) {
      await redis.ping();
    }
    return { status: 'healthy' };
  } catch (err) {
    throw new Error(`Redis unreachable: ${err.message}`);
  }
});

healthcheck.registerReadinessCheck('twilio', async () => {
  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    const balance = await client.balance.fetch();
    return { 
      status: 'healthy',
      balance: `$${balance.balance}` 
    };
  } catch (err) {
    throw new Error(`Twilio API error: ${err.message}`);
  }
});

// Custom check for queue depth
healthcheck.registerReadinessCheck('queue_depth', async () => {
  try {
    const { smsQueue } = require('../services/queueService');
    
    const [waiting, active, delayed] = await Promise.all([
      smsQueue.getWaitingCount(),
      smsQueue.getActiveCount(),
      smsQueue.getDelayedCount()
    ]);
    
    const total = waiting + active + delayed;
    
    if (total > 10000) {
      throw new Error(`Queue backlog too high: ${total} jobs`);
    }
    
    return {
      status: 'healthy',
      metrics: { waiting, active, delayed, total }
    };
  } catch (err) {
    throw new Error(`Queue check failed: ${err.message}`);
  }
});

// Express middleware for health endpoints
const livenessEndpoint = async (req, res) => {
  try {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({ status: 'error', error: error.message });
  }
};

const readinessEndpoint = async (req, res) => {
  try {
    const result = await healthcheck.runChecks('readiness');
    const status = result.healthy ? 200 : 503;
    
    res.status(status).json({
      status: result.healthy ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks: result.checks
    });
  } catch (error) {
    res.status(503).json({ status: 'error', error: error.message });
  }
};

const healthEndpoint = async (req, res) => {
  try {
    const result = await healthcheck.runChecks('all');
    const status = result.healthy ? 200 : 503;
    
    res.status(status).json({
      status: result.healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      checks: result.checks
    });
  } catch (error) {
    res.status(503).json({ status: 'error', error: error.message });
  }
};

// Export endpoints
module.exports = {
  livenessEndpoint,
  readinessEndpoint,
  healthEndpoint,
  healthcheck
};
