// backend/src/database/init.js
// Standalone script for manual, CI, or deployment database initialization

import dotenv from 'dotenv';
import { initDatabaseSchema, checkDbConnection } from './db.js';

dotenv.config();

console.log('=========================================');
console.log('🛠️  LIFECRAFT Database Schema Initialization');
console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔌 Target: ${process.env.DATABASE_URL ? 'Neon PostgreSQL' : 'Local PGlite'}`);
console.log('=========================================');

try {
  const success = await initDatabaseSchema();
  if (success) {
    console.log('✅ Database schema and seed catalog successfully initialized.');
    process.exit(0);
  } else {
    console.error('❌ Database schema initialization failed.');
    process.exit(1);
  }
} catch (err) {
  console.error('❌ Critical error during schema initialization:', err);
  process.exit(1);
}
