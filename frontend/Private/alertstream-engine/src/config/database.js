const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased to 10 seconds
  statement_timeout: 30000, // 30 second query timeout
  query_timeout: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const query = async (text, params, retries = 3) => {
  const start = Date.now();
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Executed query', { text: text.substring(0, 100), duration, rows: res.rowCount, attempt });
      }
      
      return res;
    } catch (error) {
      lastError = error;
      
      // Retry on connection/timeout errors
      if (attempt < retries && (
        error.message.includes('timeout') ||
        error.message.includes('connection') ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT'
      )) {
        const delay = attempt * 1000; // Exponential backoff: 1s, 2s, 3s
        console.warn(`Query attempt ${attempt} failed, retrying in ${delay}ms...`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      console.error('Database query error:', error);
      throw error;
    }
  }
  
  throw lastError;
};

const getClient = async () => {
  return await pool.connect();
};

module.exports = {
  query,
  pool,
  getClient,
};
