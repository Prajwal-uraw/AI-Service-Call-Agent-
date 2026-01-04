require('dotenv').config();
const { validateEnv } = require('./src/utils/validateEnv');
validateEnv();

const app = require('./src/app');
const { startWorkers } = require('./src/services/queueService');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`AlertStream Engine running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
