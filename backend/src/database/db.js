import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// PostgreSQL Connection Pool (Managed by Member 3)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lifecraft',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Standard Query Helper
 * Usage: const { rows } = await query('SELECT * FROM users WHERE id = $1', [userId]);
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Initialize database tables and initial seed from schema.sql
 */
export const initDatabaseSchema = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(sql);
    console.log('[Database] Schema initialized successfully.');
    return true;
  } catch (err) {
    console.error('[Database] Failed to initialize schema:', err.message);
    return false;
  }
};

/**
 * Check database connection status on startup
 */
export const checkDbConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('[Database] Connected successfully to PostgreSQL at:', res.rows[0].now);
    return true;
  } catch (err) {
    console.warn('[Database] Warning: PostgreSQL not connected yet. Ensure local/hosted database is running and DATABASE_URL in .env is configured.');
    console.warn('[Database] Error message:', err.message);
    return false;
  }
};
