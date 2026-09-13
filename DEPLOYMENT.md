# LIFECRAFT — Full-Stack Vercel + Neon PostgreSQL Deployment Guide

This guide details the single-project, full-stack cloud production deployment architecture for **LIFECRAFT**:
- **Hosting Platform**: [Vercel](https://vercel.com) (Full-Stack Monorepo)
  - **Frontend**: React + Vite SPA built to `frontend/dist`
  - **Backend API**: Node/Express Serverless Function executed via `api/index.js`
- **Database**: [Neon](https://neon.tech) (Serverless, persistent PostgreSQL)

---

## 1. Target Architecture Overview

```
                               ┌────────────────────────────────────────────────────────┐
                               │                      VERCEL PROJECT                    │
                               │                https://your-app.vercel.app             │
                               │                                                        │
                               │   ┌─────────────────────┐    ┌─────────────────────┐   │
                               │   │   Static Frontend   │    │  Serverless API     │   │
                               │   │   (React / Vite)    │    │  (Node / Express)   │   │
                               │   │   frontend/dist     │    │  api/index.js       │   │
                               │   └──────────┬──────────┘    └──────────┬──────────┘   │
                               │              │ Same Domain              │              │
                               │              │ /api requests            │              │
                               │              └──────────────────────────┘              │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
                                                           │ TCP / SSL
                                                           │ DATABASE_URL (Pooled)
                                                           ▼
                               ┌────────────────────────────────────────────────────────┐
                               │                   NEON POSTGRESQL                      │
                               │        ep-xyz-pooler.region.aws.neon.tech              │
                               │      (Persistent Serverless Database Storage)          │
                               └────────────────────────────────────────────────────────┘
```

---

## 2. Vercel Project Configuration

### Monorepo Setup & Root Settings
When importing your repository from GitHub into Vercel:

| Setting | Value | Description |
|---|---|---|
| **Root Directory** | `.` (Repository root) | Deploy from root to encompass both `frontend/`, `backend/`, and `api/`. |
| **Framework Preset** | `Vite` | Automatically detected by Vercel. |
| **Build Command** | `npm run build` | Runs `npm run build --prefix frontend` to compile Vite static assets. |
| **Output Directory** | `frontend/dist` | Points to Vite production build artifacts. |
| **Install Command** | `npm install` | Installs root dependencies for `@vercel/node` runtime. |

### Routing (`vercel.json`)
The root `vercel.json` ensures that API requests are prioritized and routed to the serverless function, while client-side routes fallback to the Vite SPA:
```json
{
  "version": 2,
  "buildCommand": "npm run build:frontend",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/health",
      "destination": "/api"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 3. Neon PostgreSQL Configuration

### 1. Provisioning
1. Sign up or log into [Neon](https://neon.tech).
2. Click **Create Project**, name it `lifecraft`, and choose your closest AWS region.
3. In your Neon Dashboard, locate the **Connection Details** widget.
4. Select the **Pooled connection** checkbox (e.g. `ep-xyz-pooler.us-east-2.aws.neon.tech`).
5. Copy the connection string:
   ```
   postgresql://<user>:<password>@<ep-xyz-pooler>.<region>.aws.neon.tech/<dbname>?sslmode=require
   ```

### 2. Serverless Pooling Architecture
LIFECRAFT's database adapter (`backend/src/database/db.js`) is tuned for serverless execution:
- **Global Pool Caching**: Cached on `globalThis.__lifecraft_pool` to reuse connections across warm lambda invocations.
- **Connection Limits**: Default `max: 10` (customizable via `DB_POOL_MAX`) with `idleTimeoutMillis: 30000` to prevent exhausting Neon connection quotas.
- **SSL**: Automatically enabled (`rejectUnauthorized: false`) for cloud-hosted endpoints.

### 3. Serverless-Safe Schema Initialization
- **Controlled Cold Start**: On function cold start, `ensureDbInitialized()` runs a lightweight probe query (`SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'items'`).
- If tables already exist and have rows, the heavy `schema.sql` and seeding are **completely bypassed** (~5ms).
- If tables do not exist (first run), the schema, cosmetic catalog, and achievements are idempotently initialized with `ON CONFLICT` guards.
- **Manual Initialization Option**: You can run `npm run db:init` locally with `DATABASE_URL` set to provision the schema beforehand.

---

## 4. Production Environment Variables

Configure under **Project Settings → Environment Variables** in the Vercel Dashboard:

| Variable | Required | Example | Description |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require` | Neon PostgreSQL pooled connection string. |
| `JWT_SECRET` | **Yes** | `64_char_cryptographically_secure_random_string` | Secret key for signing and verifying player session JWT tokens. |
| `JWT_EXPIRES_IN` | Optional | `7d` | Session lifetime (default: 7 days). |
| `NODE_ENV` | **Yes** | `production` | Enforces production security checks and error sanitization. |
| `DB_POOL_MAX` | Optional | `10` | Maximum connections per serverless container instance. |
| `FRONTEND_URL` | Optional | `https://your-project.vercel.app` | Production origin. (Same-origin and `*.vercel.app` preview domains are automatically allowed). |

> [!NOTE]
> `VITE_API_URL` is **not** required in full-stack Vercel deployments. The frontend automatically sends API requests to relative `/api`, which resolves seamlessly to the backend serverless function on the same origin.

---

## 5. Security & Error Handling

- **Error Sanitization**: In production, all unhandled 500-level errors return a sanitized message (`"An unexpected server error occurred. Please try again later."`) without leaking database internals, SQL queries, stack traces, or server filesystem paths.
- **Stateless Architecture**: No dependence on local disk writes (`backend/data/` is only used for local development fallback with PGlite).
- **Demo Passcode**: Developer View is protected by the demo passcode `LIFECRAFT`.

---

## 6. Pre-Deployment Verification Checklist

Before deploying:

1. **Frontend Production Build**:
   ```bash
   npm run build
   ```
   Must complete with exit code 0.
2. **Backend Tests**:
   ```bash
   node backend/src/progression/progressionService.test.js
   node backend/src/quests/questLogic.test.js
   ```
   Both test suites must pass.
3. **Vercel Serverless Function Local Test**:
   Test `api/index.js` response on `/health` and `/api/health`.
4. **Static 3D Assets**:
   Verify all models and textures exist under `frontend/public/assets/world/`.

---

## 7. Step-by-Step Vercel Deployment

1. **Push to GitHub**: Push latest `main` branch to your repository.
2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your `LifeCraft_WebD_HACKATHON` repository.
   - Leave Root Directory as `.` (root).
   - Framework preset will detect `Vite`.
3. **Set Environment Variables**:
   - Add `DATABASE_URL` (your Neon pooled connection string).
   - Add `JWT_SECRET` (e.g. `openssl rand -hex 32`).
   - Add `NODE_ENV=production`.
4. **Deploy**:
   - Click **Deploy**.
   - Vercel builds the frontend to `frontend/dist` and provisions `api/index.js` as the serverless API.
5. **Verify**:
   - Navigate to `https://your-deployment.vercel.app/health` → verify `{ "status": "ok" }`.
   - Open the web app, register an account, create and complete a quest, and explore the 3D world.
