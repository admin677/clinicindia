import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const pgp = pgPromise();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'clinicindia',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 30,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create database connection instance
export const db = pgp(dbConfig);

// Test connection
export const testConnection = async () => {
  try {
    const result = await db.one('SELECT NOW()');
    console.log('✓ Database connected:', result);
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    return false;
  }
};

export default db;
