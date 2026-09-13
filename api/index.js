// api/index.js
// Vercel Serverless Function entrypoint for LIFECRAFT Backend API

import app from '../backend/src/app.js';
import { ensureDbInitialized } from '../backend/src/database/db.js';

export default async function handler(req, res) {
  // Controlled one-time database connection & schema check across cold starts
  try {
    await ensureDbInitialized();
  } catch (err) {
    console.error('[Vercel API] Database connection notice:', err.message);
  }

  // Delegate request processing to Express application
  return app(req, res);
}
