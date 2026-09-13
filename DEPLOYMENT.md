# LIFECRAFT — Production Deployment Guide: Vercel + Railway

This guide details the two-service cloud production deployment architecture for **LIFECRAFT**:
- **Frontend**: Hosted on [Vercel](https://vercel.com) (Vite SPA)
- **Backend**: Hosted on [Railway](https://railway.app) (Node/Express API)
- **Database**: Railway Managed PostgreSQL attached directly to the Backend service

---

## 1. Target Architecture Overview

```
                               ┌────────────────────────┐
                               │   Vercel Edge CDN      │
                               │   (Frontend Web App)   │
                               │  lifecraft.vercel.app  │
                               └───────────┬────────────┘
                                           │
                        HTTPS / JSON       │  Authorization: Bearer <JWT>
                        CORS: FRONTEND_URL │  VITE_API_URL
                                           ▼
                               ┌────────────────────────┐
                               │   Railway Service      │
                               │   (Node/Express API)   │
                               │   GET /health → 200 ok │
                               └───────────┬────────────┘
                                           │
                               TCP / SSL   │  DATABASE_URL
                               Pool: 10    │  Automated schema init
                                           ▼
                               ┌────────────────────────┐
                               │   Railway PostgreSQL   │
                               │   (Persistent Storage) │
                               └────────────────────────┘
```

---

## 2. Service 1: Frontend (Vercel)

### Project Configuration
- **Platform**: Vercel
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (or `npm run build --prefix frontend` from repository root)
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Routing Configuration**: Handled by `frontend/vercel.json` (rewrites all routes to `/index.html` for single-page app client-side routing)

### Environment Variables
Configure under **Project Settings → Environment Variables**:

| Variable | Required | Value Example | Description |
|---|---|---|---|
| `VITE_API_URL` | **Yes** | `https://your-backend.up.railway.app/api` | Full public URL of the Railway backend API, including `/api`. |

### Static 3D Assets
All 3D models, textures, skyboxes, and colormaps are strictly bundled in:
```
frontend/public/assets/world/
├── buildings/      # Realm spires, academies, coliseums, foundries
├── characters/     # Archer, Sage Wanderer, Champion Knight, Artisan Crafter models & textures
├── environment/    # Bridges, platforms, island terrain
├── nature/         # Foliage, trees, rocks
├── pets/           # Companion pets (Fox, Lion, Panda, Cat) & colormaps
├── props/          # Banners, fountains, lanterns, marketplace stalls
└── skybox/         # Procedural and texture assets
```
There is **zero** runtime dependency on `assets_lib/`.

---

## 3. Service 2: Backend (Railway)

### Project Configuration
- **Platform**: Railway
- **Root Directory**: `backend` (or set Railway Watch Paths to `/backend/**`)
- **Build Command**: `npm install`
- **Start Command**: `npm start` (executes `node src/server.js`)
- **Health Check Endpoint**: `/health` (returns `{"status":"ok"}` with HTTP 200)

### Environment Variables
Configure under **Variables** in your Railway Backend service:

| Variable | Required | Default / Example | Description |
|---|---|---|---|
| `PORT` | **Yes** | Provided by Railway (`$PORT`) | Express server port (automatically allocated by Railway). |
| `NODE_ENV` | **Yes** | `production` | Sets server to production mode (enables secure error sanitization). |
| `FRONTEND_URL` | **Yes** | `https://your-frontend.vercel.app` | Vercel production domain for strict CORS credentials verification. |
| `DATABASE_URL` | **Yes** | `${{Postgres.DATABASE_URL}}` | Connection string to Railway PostgreSQL. |
| `JWT_SECRET` | **Yes** | Generated 64-char string | Cryptographic secret for signing player JWT authentication tokens. |
| `JWT_EXPIRES_IN`| Optional | `7d` | Token lifetime duration. |

### Health Check Endpoint
- **Path**: `GET /health`
- **Expected Status**: `200 OK`
- **Response**:
  ```json
  {
    "status": "ok"
  }
  ```
- **Alternative Path**: `GET /api/health` (returns detailed status for observability)

---

## 4. Service 3: Database (Railway PostgreSQL)

### Provisioning
1. In the Railway project dashboard, click **New → Database → Add PostgreSQL**.
2. Railway creates a managed PostgreSQL instance and exposes the internal connection string variable `DATABASE_URL`.
3. In the Backend service settings, reference or attach the variable:
   `DATABASE_URL=${{Postgres.DATABASE_URL}}`

### Automated Schema Initialization
On server startup, `backend/src/database/db.js` runs `initDatabaseSchema()`:
1. Executes cosmetic item deduplication and enforces the unique constraint:
   `CREATE UNIQUE INDEX IF NOT EXISTS idx_items_asset_key ON items(asset_key)`
2. Safely executes `backend/src/database/schema.sql` which provisions:
   - `users` (Account credentials, hashed passwords)
   - `players` (RPG stats, level, xp, gold, streak, realm XP, equipped skins/pets/decor, mastery expansions)
   - `quests` (Productivity quests & mastery side quests)
   - `items` (Cosmetic catalog with unique `asset_key` constraints)
   - `inventories` (Purchased items & ownership mapping with `UNIQUE(user_id, item_id)`)
   - `achievements` & `user_achievements` (Trophies & milestones)
   - `events` (Activity timeline audit log)
3. Seeds all catalog items and achievements with `ON CONFLICT` guards.

### Persistence Guarantee
- Production uses persistent Railway PostgreSQL over TCP with SSL (`rejectUnauthorized: false`).
- Embedded `PGlite` (`backend/data/lifecraft_pg`) is **never** used in production; if `DATABASE_URL` is missing or fails in production, the backend intentionally throws an error on startup to prevent silent fallback to ephemeral container disk.

---

## 5. CORS Configuration

The production authentication flow requires cross-origin credentialed requests from Vercel to Railway:
```
Vercel Frontend (https://lifecraft.vercel.app)
       │
       ▼ Authorization: Bearer <token>
Railway Backend API (https://lifecraft-api.up.railway.app)
```

- In `backend/src/server.js`, CORS is configured with:
  - Allowed origin matches `process.env.FRONTEND_URL` exactly.
  - Wildcard `*` is strictly disabled in production.
  - Allowed methods: `GET, POST, PUT, DELETE, PATCH, OPTIONS`.
  - Allowed headers: `Content-Type, Authorization, X-Requested-With`.
  - `credentials: true`.

---

## 6. Authentication & Token Flow

1. **Registration**: `POST /api/auth/register` creates user and initializes player profile with starting attributes, gold, and skin.
2. **Login**: `POST /api/auth/login` verifies bcrypt password hash and returns JWT token.
3. **Frontend Storage**: Frontend stores JWT in `localStorage` under `lifecraft_token`.
4. **Subsequent API Requests**: All requests attach `Authorization: Bearer <token>` in headers.
5. **Token Expiry / Refresh**: Tokens remain valid for `7d`. On logout (`POST /api/auth/logout`), frontend cleanses `localStorage` and resets player state.

---

## 7. Production Error Handling

In `backend/src/middleware/errorHandler.js`:
- In `production` (`NODE_ENV=production`), all HTTP 500 errors are sanitized to:
  ```json
  {
    "success": false,
    "data": null,
    "error": {
      "code": "INTERNAL_SERVER_ERROR",
      "message": "An unexpected server error occurred. Please try again later."
    }
  }
  ```
- Raw database errors, SQL syntax strings, stack traces, and local filesystem paths are logged to Railway server stdout only and never leaked in HTTP responses.

---

## 8. Verification & Pre-Deployment Checklist

Before deploying:

1. **Frontend Production Build**:
   ```bash
   npm run build --prefix frontend
   ```
   Must succeed with exit code 0.
2. **Backend Health Check**:
   ```bash
   curl http://localhost:5000/health
   # Response: {"status":"ok"}
   ```
3. **Database Connectivity**:
   Ensure `DATABASE_URL` connects with SSL.
4. **Auth Flow**:
   Register a new user, log in, create a quest, complete it, earn XP and gold, purchase a pet in the shop, equip it, reload the page, and verify all data persists across sessions.
