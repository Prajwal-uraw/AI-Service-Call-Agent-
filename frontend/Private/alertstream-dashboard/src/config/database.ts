import { Pool } from 'pg';

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'alertstream',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Log connection events
pool.on('connect', () => {
  console.log('Database connection established');
});

pool.on('error', (err) => {
  console.error('Unexpected database error', err);
  process.exit(-1);
});

// Test connection
export const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('Database test query successful:', result.rows[0]);
    
    client.release();
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

// Query helper function
export const query = async (text: string, params?: any[]): Promise<any> => {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    console.log('Executed query', {
      text,
      duration,
      rows: result.rowCount
    });
    
    return result;
  } catch (error) {
    console.error('Query failed', { text, params, error });
    throw error;
  }
};

// Transaction helper
export const transaction = async (callback: (client: any) => Promise<any>) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT 1 as healthy');
    return result.rows[0].healthy === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

export default pool;
