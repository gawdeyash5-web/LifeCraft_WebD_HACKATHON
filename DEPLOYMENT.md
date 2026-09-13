# LIFECRAFT — Production Deployment Guide

This document specifies the authoritative deployment architecture, configuration, persistence requirements, and verification procedures for **LIFECRAFT**.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or later (v20+ recommended)
- **Package Manager**: npm v9+ (or pnpm / yarn)
- **Database Options**:
  - **Option A (Recommended for Multi-Instance / Cloud Containers)**: External PostgreSQL 14+ (e.g. Supabase, Neon, AWS RDS, GCP Cloud SQL, or a managed PostgreSQL instance).
  - **Option B (Embedded)**: Embedded PostgreSQL ([PGlite](https://pglite.electric-sql.com/)) with a persistent disk volume mounted at `backend/data/`.

---

## 2. Environment Variables

### Backend Configuration (`backend/.env` or Container Environment)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | Optional | `5000` | HTTP port the Express backend server listens on. |
| `NODE_ENV` | Optional | `production` | Node environment flag (`production` or `development`). |
| `CLIENT_URL` | **Required in Prod** | `http://localhost:5173` | Allowed CORS origin(s). Supports comma-separated origins (e.g., `https://lifecraft.app,https://admin.lifecraft.app`) or `*`. |
| `DATABASE_URL` | Recommended | None (falls back to PGlite) | Full PostgreSQL connection string: `postgresql://<user>:<password>@<host>:<port>/<dbname>?sslmode=require`. |
| `JWT_SECRET` | **Required in Prod** | Dev fallback | Cryptographic secret for signing player JWT authentication tokens. Must be at least 32 characters long. |
| `JWT_EXPIRES_IN` | Optional | `7d` | JWT session token expiration window (e.g. `7d`, `24h`). |

### Frontend Configuration (`frontend/.env` or Build-time Environment)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | Optional | `""` (defaults to `/api` in production) | Base URL for API requests. In production, if unset, defaults to relative `/api` for reverse proxy setups (Nginx, Caddy, Cloudflare). If deploying API to a separate domain, set to `https://api.yourdomain.com/api`. |

---

## 3. Frontend Build Command

To compile the production frontend bundle:

```bash
npm run build --prefix frontend
```

The optimized static assets will be output to:
```
frontend/dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── ...
```

To preview the production build locally:
```bash
npm run preview --prefix frontend
```

---

## 4. Backend Start Command

To start the backend in production mode:

```bash
npm start --prefix backend
```
*(Runs `node src/server.js`)*

For process management, use a process supervisor like PM2 or Docker:
```bash
pm2 start backend/src/server.js --name lifecraft-backend
```

---

## 5. Database Architecture & Initialization

LIFECRAFT employs a dual-engine architecture in `backend/src/database/db.js`:

1. **Native PostgreSQL (`postgres`)**:
   - When `DATABASE_URL` is set, the server connects via `pg.Pool`.
   - Schema is automatically initialized on first run from `backend/src/database/schema.sql`.
   - Seed catalog items (shop cosmetics, base items) are safely seeded with `ON CONFLICT DO NOTHING`.
2. **Embedded PostgreSQL (`pglite`)**:
   - If `DATABASE_URL` is unavailable, the backend automatically initializes an embedded WebAssembly PostgreSQL engine (`@electric-sql/pglite`) located at `backend/data/lifecraft_pg`.
   - Runs full relational PostgreSQL transactions and SQL features without requiring a separate database daemon.

### Critical Database Persistence Requirement:
> [!IMPORTANT]
> When using the embedded PGlite engine in cloud container environments (Docker, AWS ECS, Fly.io, Render, Railway), **`backend/data/` MUST be mounted to a persistent disk volume**. Ephemeral container filesystems will lose player accounts, quests, and mastery progression upon container restart. For stateless container deployments, configure `DATABASE_URL` pointing to an external PostgreSQL instance.

---

## 6. CORS Configuration

CORS is managed in `backend/src/server.js`:
- Respects `CLIENT_URL`.
- Accepts single origins, comma-separated lists of domains, or `*`.
- Includes `credentials: true` to support authenticated cookies or Authorization headers.

Example:
```env
CLIENT_URL=https://lifecraft.app,https://www.lifecraft.app
```

---

## 7. Production Frontend API Configuration

In `frontend/src/services/api.js`, the API base URL is resolved dynamically:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');
```
- **Same-Domain / Reverse Proxy**: Do not set `VITE_API_URL`. Requests will route to `/api/...` on the current domain.
- **Cross-Domain (Decoupled Frontend & Backend)**: Set `VITE_API_URL=https://api.yourdomain.com/api` before running `npm run build --prefix frontend`.

---

## 8. Asset Requirements

All 3D assets, GLB meshes, textures, and UI icons required for production are strictly contained within:
```
frontend/public/assets/
├── world/
│   ├── buildings/      # Realm spires, academies, coliseums, foundries
│   ├── characters/     # Player skins (archer, sage, champion, artisan)
│   ├── pets/           # Companion pets & authored colormaps
│   ├── props/          # Banners, lanterns, fountains, trees, rocks
│   └── ...
```

> [!NOTE]
> The development directory `assets_lib/` is excluded from the build and tracked in `.gitignore`. Production builds have zero dependency on `assets_lib/`.

---

## 9. Health Check & Diagnostics

The backend provides a non-authenticated health check endpoint:

- **Endpoint**: `GET /api/health`
- **Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "lifecraft-backend",
    "uptime": 142.5,
    "timestamp": "2026-09-13T04:25:00.000Z"
  }
}
```

Use this URL for container liveness/readiness probes (Kubernetes, AWS ALB, Render, Railway).

---

## 10. Post-Deployment Verification Checklist

After deploying to staging or production, execute this quick verification:

1. **Health Check**: Verify `GET /api/health` returns `200 OK` with `"status": "healthy"`.
2. **Registration & Auth**: Create a new player account and verify JWT issuance.
3. **World Diorama Loading**: Verify the 3D diorama renders with textures, lighting, and ambient motes with no WebGL/GLTF console errors.
4. **Quest CRUD**: Create a quest, complete it, and verify gold, streak, and realm XP rewards update immediately.
5. **Cosmetics & Pets**: Open the Shop, purchase/equip a companion pet and character skin, and verify textures render properly.
6. **Sub-Island Mastery Travel**:
   - Access Developer View via passcode `LIFECRAFT` or attain Level 3 in a realm.
   - Verify the physical sub-islands (Celestial Library, Gladiatorial Coliseum, Foundry) hover connected by bridges.
   - Click each sub-island destination: verify the camera frames the sub-island, the player walks across the bridge, and idle breathing animates on arrival.
   - Click "Return to World": verify the player walks back across the bridge to the main island.
7. **Persistence Verification**: Refresh the browser page and confirm player level, gold, equipped cosmetics, and mastery expansions persist.
