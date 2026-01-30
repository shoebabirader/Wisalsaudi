/**
 * PostgreSQL Database Connection
 * Manages connection pool for PostgreSQL database
 */

import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'wisal',
  user: process.env.POSTGRES_USER || 'wisal',
  password: process.env.POSTGRES_PASSWORD || 'wisal_password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

pool.on('error', (err: Error) => {
  console.error('❌ PostgreSQL connection error:', err);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

export const closePool = async () => {
  await pool.end();
  console.log('PostgreSQL pool closed');
};

export default pool;
