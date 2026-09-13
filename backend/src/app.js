import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Production origins configured via FRONTEND_URL or CLIENT_URL
const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
]
  .filter(Boolean)
  .flatMap((val) => val.split(',').map((s) => s.trim().replace(/\/+$/, '')))
  .filter(Boolean);

const devOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const allowedOrigins = isProduction
  ? configuredOrigins
  : [...new Set([...configuredOrigins, ...devOrigins])];

// 1. Core Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin, server-to-server, health check probes, or non-browser requests
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, '');

    // Allow explicitly configured origins
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // Automatically allow Vercel deployment preview and production URLs (*.vercel.app)
    if (normalizedOrigin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // In local development, permit localhost origins
    if (!isProduction && devOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy: Origin ${origin} is not permitted.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Request Logging Middleware (Development)
app.use((req, res, next) => {
  if (!isProduction) {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Primary Health Check for Vercel / Cloud orchestrators
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Root API Info Route
app.get('/', (req, res) => {
  res.json({
    project: 'LIFECRAFT API',
    status: 'Running',
    health: '/health',
    apiHealth: '/api/health'
  });
});

// 3. Mount Central API Router at /api (and / for stripped-prefix serverless routing)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// 4. Global Error Handler
app.use(errorHandler);

export default app;
