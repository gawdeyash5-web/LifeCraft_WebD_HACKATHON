import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PGlite } from '@electric-sql/pglite';
import { schemaSql } from './schema.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

let activeEngine = null; // 'postgres' | 'pglite'
let pgPool = globalThis.__lifecraft_pool || null;
let pgliteDb = null;
let isSchemaInitialized = globalThis.__lifecraft_schema_initialized || false;
let initPromise = null;

/**
 * Initialize and verify database engine.
 * Production: Strictly uses Neon/hosted PostgreSQL via DATABASE_URL with connection pooling.
 * Local Development: Falls back to embedded PGlite if DATABASE_URL is unset.
 */
async function getEngine() {
  if (activeEngine && (pgPool || pgliteDb)) return activeEngine;

  const isProduction = process.env.NODE_ENV === 'production';
  const databaseUrl = process.env.DATABASE_URL;

  // 1. Hosted PostgreSQL (Neon / Production)
  if (databaseUrl || isProduction) {
    if (!databaseUrl) {
      const err = new Error('[Database] FATAL: DATABASE_URL is not set in production. Neon PostgreSQL is required.');
      console.error(err.message);
      throw err;
    }

    if (!pgPool) {
      try {
        const isLocalHost = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
        const poolConfig = {
          connectionString: databaseUrl,
          max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
          ssl: isLocalHost ? false : { rejectUnauthorized: false },
        };

        pgPool = new Pool(poolConfig);
        globalThis.__lifecraft_pool = pgPool;

        pgPool.on('error', (poolErr) => {
          console.error('[Database] Idle client error on PostgreSQL pool:', poolErr.message);
        });

        // Test connectivity
        const res = await pgPool.query('SELECT NOW()');
        console.log('[Database] Connected to PostgreSQL (Neon) at:', res.rows[0].now);
      } catch (err) {
        console.error('[Database] Critical error connecting to hosted PostgreSQL via DATABASE_URL:', err.message);
        // In production, never fall back to ephemeral local PGlite
        throw err;
      }
    }

    activeEngine = 'postgres';
    return 'postgres';
  }

  // 2. Local Development Fallback: Embedded PGlite
  try {
    console.log('[Database] No production DATABASE_URL configured. Initializing embedded PostgreSQL (PGlite)...');

    const dataDir = path.resolve(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const pgliteDir = path.join(dataDir, 'lifecraft_pg');

    // Clean up stale lock/pid file if previous process was terminated
    const pidFile = path.join(pgliteDir, 'postmaster.pid');
    if (fs.existsSync(pidFile)) {
      try {
        fs.unlinkSync(pidFile);
        console.log('[Database] Cleared stale postmaster.pid lock file.');
      } catch (e) {
        // Ignore if locked
      }
    }

    try {
      pgliteDb = new PGlite(pgliteDir);
      await pgliteDb.waitReady;
    } catch (openErr) {
      console.warn('[Database] Local PGlite store corrupted or unrecovered. Rebuilding local development store...');
      fs.rmSync(pgliteDir, { recursive: true, force: true });
      pgliteDb = new PGlite(pgliteDir);
      await pgliteDb.waitReady;
    }

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
 */
export const query = async (text, params = []) => {
  const engine = await getEngine();
  if (engine === 'postgres') {
    return await pgPool.query(text, params);
  } else {
    const res = await pgliteDb.query(text, params);
    return {
      rows: res.rows || [],
      rowCount: res.rows ? res.rows.length : (res.affectedRows || 0),
    };
  }
};

/**
 * Transaction / Client Acquisition Helper
 */
export const getClient = async () => {
  const engine = await getEngine();
  if (engine === 'postgres') {
    return await pgPool.connect();
  } else {
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

export const pool = {
  query: (text, params) => query(text, params),
  connect: () => getClient(),
};

/**
 * Ensures the items table has exactly one canonical row per cosmetic asset_key
 * and enforces uniqueness so duplicate items can never re-occur.
 */
async function deduplicateAndEnforceItemConstraints() {
  try {
    const checkTable = await query(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'items'"
    );
    if (checkTable.rows.length === 0) return;

    const itemsRes = await query(
      'SELECT id, asset_key as "assetKey" FROM items ORDER BY asset_key ASC, created_at ASC'
    );

    const seen = new Map();
    const duplicates = [];
    for (const row of itemsRes.rows) {
      if (!seen.has(row.assetKey)) {
        seen.set(row.assetKey, row.id);
      } else {
        duplicates.push({ duplicateId: row.id, canonicalId: seen.get(row.assetKey) });
      }
    }

    if (duplicates.length > 0) {
      console.log(`[Database] Deduplicating ${duplicates.length} duplicate cosmetic item rows...`);
      for (const { duplicateId, canonicalId } of duplicates) {
        const invRows = await query(
          'SELECT id, user_id as "userId" FROM inventories WHERE item_id = $1',
          [duplicateId]
        );
        for (const inv of invRows.rows) {
          const existing = await query(
            'SELECT id FROM inventories WHERE user_id = $1 AND item_id = $2',
            [inv.userId, canonicalId]
          );
          if (existing.rows.length > 0) {
            await query('DELETE FROM inventories WHERE id = $1', [inv.id]);
          } else {
            await query('UPDATE inventories SET item_id = $1 WHERE id = $2', [canonicalId, inv.id]);
          }
        }
        await query('DELETE FROM items WHERE id = $1', [duplicateId]);
      }
      console.log('[Database] Item deduplication complete. Exactly 1 canonical row per asset_key.');
    }

    await query('CREATE UNIQUE INDEX IF NOT EXISTS idx_items_asset_key ON items(asset_key)');
  } catch (err) {
    console.warn('[Database] Item deduplication notice:', err.message);
  }
}

/**
 * Idempotent schema initialization
 */
export const initDatabaseSchema = async () => {
  try {
    await getEngine();
    await deduplicateAndEnforceItemConstraints();

    if (activeEngine === 'postgres') {
      await pgPool.query(schemaSql);
    } else {
      await pgliteDb.exec(schemaSql);
    }

    await query('CREATE UNIQUE INDEX IF NOT EXISTS idx_items_asset_key ON items(asset_key)');
    console.log('[Database] Database schema verified and initialized.');
    isSchemaInitialized = true;
    globalThis.__lifecraft_schema_initialized = true;
    return true;
  } catch (err) {
    console.error('[Database] Failed to initialize schema:', err.message);
    return false;
  }
};

/**
 * Serverless-Safe Lazy Database Initialization
 * Does NOT execute schema/seeds on every request.
 * Checks if tables already exist; only runs initialization once per cold start if uninitialized.
 */
export const ensureDbInitialized = async () => {
  if (isSchemaInitialized) return true;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await getEngine();

    // Fast check: if items table already exists with data, skip full schema execution
    try {
      const check = await query(
        "SELECT COUNT(*)::int as count FROM information_schema.tables WHERE table_name = 'items'"
      );
      if (check.rows[0]?.count > 0) {
        const rowCheck = await query('SELECT COUNT(*)::int as count FROM items');
        if (rowCheck.rows[0]?.count > 0) {
          isSchemaInitialized = true;
          globalThis.__lifecraft_schema_initialized = true;
          return true;
        }
      }
    } catch (probeErr) {
      // Table does not exist, run full initialization
    }

    await initDatabaseSchema();
    isSchemaInitialized = true;
    globalThis.__lifecraft_schema_initialized = true;
    return true;
  })();

  return initPromise;
};

/**
 * Check database connection status on startup
 */
export const checkDbConnection = async () => {
  try {
    await ensureDbInitialized();
    return true;
  } catch (err) {
    console.error('[Database] Database check failed:', err.message);
    return false;
  }
};
