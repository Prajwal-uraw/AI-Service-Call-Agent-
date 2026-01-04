const Queue = require('bull');
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
};

// Create queues
const smsQueue = new Queue('sms-notifications', { redis: redisConfig });
const eventQueue = new Queue('event-processing', { redis: redisConfig });

// Event processing queue
eventQueue.process('process-event', async (job) => {
  const { data } = job;
  // This can be extended for more complex event processing
  console.log('Processing event:', data.event_id);
  return { processed: true, event_id: data.event_id };
});

// NOTE: SMS queue processing is handled by the worker (src/workers/smsWorker.js)
// Do not add smsQueue.process() here to avoid duplicate processing

// Helper functions
async function enqueueSMSJob(data) {
  return smsQueue.add('send-sms', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: true
  });
}

async function enqueueEventJob(data) {
  return eventQueue.add('process-event', data);
}

async function startWorkers() {
  console.log('Starting queue workers...');
  // Workers are started automatically when we define queue.process()
}

module.exports = {
  smsQueue,
  eventQueue,
  enqueueSMSJob,
  enqueueEventJob,
  startWorkers
};
