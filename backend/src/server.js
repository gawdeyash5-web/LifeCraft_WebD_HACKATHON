import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { checkDbConnection } from './database/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const rawOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((s) => s.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

// 1. Core Middlewares
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (rawOrigins.includes('*') || rawOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Request Logging Middleware (Development)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// 3. Mount Central API Router
app.use('/api', apiRouter);

// Root fallback route
app.get('/', (req, res) => {
  res.json({
    project: 'LIFECRAFT API',
    status: 'Running',
    documentation: '/docs/API.md',
    health: '/api/health'
  });
});

// 4. Global Error Handler
app.use(errorHandler);

// 5. Start Server
const server = app.listen(PORT, async () => {
  console.log(`=========================================`);
  console.log(`⚔️  LIFECRAFT Backend API Active`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);

  // Non-blocking database check
  await checkDbConnection();
});

export default app;
