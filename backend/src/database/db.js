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
 * Ensures the items table has exactly one canonical row per cosmetic asset_key
 * and enforces uniqueness so duplicate items can never re-occur.
 */
async function deduplicateAndEnforceItemConstraints() {
  try {
    // 1. Check if items table exists
    const checkTable = await query(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'items'"
    );
    if (checkTable.rows.length === 0) return;

    // 2. Query all existing items ordered by asset_key and creation date
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
        // Find any user inventories pointing to this duplicate item
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
            // User already has an inventory row for the canonical item
            await query('DELETE FROM inventories WHERE id = $1', [inv.id]);
          } else {
            // Remap to canonical item
            await query('UPDATE inventories SET item_id = $1 WHERE id = $2', [canonicalId, inv.id]);
          }
        }
        // Delete the duplicate item row
        await query('DELETE FROM items WHERE id = $1', [duplicateId]);
      }
      console.log('[Database] Item deduplication complete. Exactly 1 canonical row per asset_key.');
    }

    // 3. Enforce UNIQUE index on items(asset_key)
    await query('CREATE UNIQUE INDEX IF NOT EXISTS idx_items_asset_key ON items(asset_key)');
  } catch (err) {
    console.warn('[Database] Item deduplication notice:', err.message);
  }
}

/**
 * Initialize database tables and initial seed from schema.sql
 */
export const initDatabaseSchema = async () => {
  try {
    await getEngine();

    // Reconcile and clean any legacy duplicate items before running schema
    await deduplicateAndEnforceItemConstraints();

    const schemaPath = path.join(__dirname, 'schema.sql');
    let sql = fs.readFileSync(schemaPath, 'utf8');

    if (activeEngine === 'postgres') {
      await pgPool.query(sql);
    } else {
      await pgliteDb.exec(sql);
    }

    // Guarantee unique index exists post-schema execution
    await query('CREATE UNIQUE INDEX IF NOT EXISTS idx_items_asset_key ON items(asset_key)');

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
