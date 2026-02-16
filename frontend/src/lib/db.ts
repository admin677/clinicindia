import { Pool, QueryResult } from 'pg';

// Create a single pool instance to reuse connections
let pool: Pool;

function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err);
    });

    pool.on('connect', () => {
      console.log('New database connection established');
    });

    pool.on('remove', () => {
      console.log('Database connection removed from pool');
    });
  }

  return pool;
}

// Query function with connection pooling
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();
  
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    console.log('Query executed:', {
      query: text.substring(0, 100),
      params: params?.length || 0,
      duration: `${duration}ms`,
      rows: result.rows.length,
    });

    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Get a single row
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
}

// Get multiple rows
export async function queryMany<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows;
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection test successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Close pool (useful for serverless cleanup)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null as any;
    console.log('Database pool closed');
  }
}

export default getPool();
