import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PGlite } from '@electric-sql/pglite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

let activeEngine = null; // 'postgres' | 'pglite'
let pgPool = null;
let pgliteDb = null;

// Ensure persistent storage directory exists for PGlite
const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const pgliteDir = path.join(dataDir, 'lifecraft_pg');

/**
 * Initialize and verify database engine.
 * First tries native PostgreSQL; falls back to embedded WASM PostgreSQL (PGlite)
 * with full disk persistence, transactions, and SQL compatibility.
 */
async function getEngine() {
  if (activeEngine) return activeEngine;

  // 1. Try external PostgreSQL connection
  try {
    const testPool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lifecraft',
      connectionTimeoutMillis: 1500,
    });
    const res = await testPool.query('SELECT NOW()');
    pgPool = testPool;
    activeEngine = 'postgres';
    console.log('[Database] Connected to external PostgreSQL at:', res.rows[0].now);
    return 'postgres';
  } catch (err) {
    console.log('[Database] External PostgreSQL unavailable. Initializing embedded PostgreSQL (PGlite)...');
  }

  // 2. Fall back to embedded PGlite
  try {
    pgliteDb = new PGlite(pgliteDir);
    activeEngine = 'pglite';
    console.log(`[Database] Embedded PostgreSQL (PGlite) active. Data directory: ${pgliteDir}`);
    return 'pglite';
  } catch (err) {
    console.error('[Database] Critical error initializing PGlite:', err);
    throw err;
  }
}

/**
 * Standard Query Helper
 * Usage: const { rows } = await query('SELECT * FROM users WHERE id = $1', [userId]);
 */
export const query = async (text, params = []) => {
  const engine = await getEngine();
  if (engine === 'postgres') {
    return await pgPool.query(text, params);
  } else {
    // PGlite query
    const res = await pgliteDb.query(text, params);
    return {
      rows: res.rows || [],
      rowCount: res.rows ? res.rows.length : (res.affectedRows || 0),
    };
  }
};

/**
 * Transaction / Client Acquisition Helper
 * Provides standard pg.Client interface across both native PG and embedded PGlite.
 */
export const getClient = async () => {
  const engine = await getEngine();
  if (engine === 'postgres') {
    return await pgPool.connect();
  } else {
    // Return wrapped PGlite client supporting BEGIN / COMMIT / ROLLBACK transactions
    return {
      query: async (text, params = []) => {
        const res = await pgliteDb.query(text, params);
        return {
          rows: res.rows || [],
          rowCount: res.rows ? res.rows.length : (res.affectedRows || 0),
        };
      },
      release: () => {},
    };
  }
};

// Export pool wrapper for backward compatibility with existing code
export const pool = {
  query: (text, params) => query(text, params),
  connect: () => getClient(),
};

/**
 * Initialize database tables and initial seed from schema.sql
 */
export const initDatabaseSchema = async () => {
  try {
    await getEngine();
    const schemaPath = path.join(__dirname, 'schema.sql');
    let sql = fs.readFileSync(schemaPath, 'utf8');

    if (activeEngine === 'postgres') {
      await pgPool.query(sql);
    } else {
      await pgliteDb.exec(sql);
    }
    console.log('[Database] Production schema verified and initialized.');
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
    await getEngine();
    await initDatabaseSchema();
    return true;
  } catch (err) {
    console.error('[Database] Database check failed:', err.message);
    return false;
  }
};
