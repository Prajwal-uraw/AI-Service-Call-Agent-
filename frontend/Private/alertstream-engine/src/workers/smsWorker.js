const { smsQueue } = require('../services/queueService');
const smsService = require('../services/smsService');
const logger = require('../utils/logger');

// Process SMS queue
smsQueue.process(async (job) => {
  const { trigger_id, event_id, website_id, event_type, metadata } = job.data;
  
  try {
    logger.info(`Processing SMS job for event ${event_id}`);
    
    await smsService.send(job.data);
    
    logger.info(`SMS sent successfully for event ${event_id}`);
    return { success: true, event_id };
  } catch (error) {
    logger.error(`SMS sending failed for event ${event_id}:`, error);
    throw error; // Will trigger retry based on queue configuration
  }
});

// Queue event listeners
smsQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} completed successfully`, result);
});

smsQueue.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed:`, err);
});

smsQueue.on('stalled', (job) => {
  logger.warn(`Job ${job.id} stalled`);
});

logger.info('SMS Worker started and listening for jobs');

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing SMS worker gracefully');
  await smsQueue.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing SMS worker gracefully');
  await smsQueue.close();
  process.exit(0);
});
