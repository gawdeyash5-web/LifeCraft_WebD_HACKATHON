# LIFECRAFT ⚔️🌱
> **Turn Real-Life Productivity Into an Interactive 3D RPG Experience**

Built for the Web Development Hackathon.

---

## 🌟 Core Concept
LIFECRAFT turns everyday personal development and productivity into an engaging role-playing game. 
- Complete real-world tasks (coding, studying, workouts, reading).
- Earn **XP**, **Gold**, and progress individual attributes (**Intelligence**, **Strength**, **Creativity**, **Wisdom**, **Discipline**).
- Level up through a non-linear progression curve.
- Spend earned gold in the virtual reward & cosmetic shop.
- Explore a **lightweight, stylized 3D world** divided into thematic regions (*Mind/Knowledge*, *Body*, *Craft/Coding*) that visually react to your progression in real-time.

---

## 👥 Team Roles & Module Ownership

To prevent merge conflicts during this fast-paced 8-hour sprint, strict directory boundaries are established:

| Member | Focus Area | Primary Directories Owned |
| :--- | :--- | :--- |
| **Member 1** | **3D World & UI Experience** | `frontend/src/features/world/`<br>`frontend/src/components/`<br>`frontend/src/styles/` |
| **Member 2** | **Quests & Progression** | `frontend/src/features/quests/`<br>`backend/src/quests/`<br>`backend/src/progression/` |
| **Member 3** | **Auth, Player, Economy & DB** | `frontend/src/features/player/`<br>`frontend/src/features/economy/`<br>`backend/src/auth/`<br>`backend/src/player/`<br>`backend/src/economy/`<br>`backend/src/database/` |

> ⚠️ **Strict Rule:** Shared entry files (`frontend/src/App.jsx`, `frontend/src/main.jsx`, `backend/src/server.js`, and package manifests) should NOT be modified without explicit team agreement.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18.0.0 or higher recommended)
- PostgreSQL (local instance or cloud database like Supabase/Neon/Railway)

### 2. Install Dependencies
Run from the root repository directory:
```bash
npm run install:all
```
*(Or navigate to `/frontend` and `/backend` separately and run `npm install`)*

### 3. Environment Setup
Copy the sample environment configs:
```bash
# In backend
cp backend/.env.example backend/.env

# In frontend (optional defaults work for local dev)
cp frontend/.env.example frontend/.env
```

### 4. Run Development Servers
To run both backend and frontend together from root:
```bash
npm run dev
```

Or run them individually in separate terminal tabs:
```bash
# Terminal 1: Backend (Runs on http://localhost:5000)
npm run dev:backend

# Terminal 2: Frontend (Runs on http://localhost:5173)
npm run dev:frontend
```

---

## 📁 Repository Structure

```text
LIFECRAFT/
├── frontend/                     # React + Vite + Tailwind + Three.js / R3F
│   ├── src/
│   │   ├── app/                  # Top-level state/context provider setup
│   │   ├── components/           # Shared UI components (Member 1)
│   │   ├── pages/                # Page layouts / views
│   │   ├── features/
│   │   │   ├── world/            # 3D interactive scene & canvas (Member 1)
│   │   │   ├── quests/           # Quest tracking, creation, completion (Member 2)
│   │   │   ├── player/           # Stats, level, streaks, attributes (Member 3)
│   │   │   └── economy/          # Shop & inventory interfaces (Member 3)
│   │   ├── services/             # Centralized API service & HTTP client
│   │   ├── hooks/                # Custom React hooks
│   │   ├── utils/                # Utility helpers & contracts
│   │   ├── styles/               # Tailwind & custom CSS (Member 1)
│   │   ├── App.jsx               # Shared root application layout
│   │   └── main.jsx              # React DOM entry
│   ├── vite.config.js
│   └── package.json
│
├── backend/                      # Node.js + Express + PostgreSQL REST API
│   ├── src/
│   │   ├── auth/                 # JWT authentication & registration (Member 3)
│   │   ├── player/               # Player stats & profile data (Member 3)
│   │   ├── quests/               # Quest CRUD & completion handling (Member 2)
│   │   ├── progression/          # XP curve, leveling, attribute math (Member 2)
│   │   ├── economy/              # Shop catalog & inventory logic (Member 3)
│   │   ├── database/             # PostgreSQL connection pool & schema (Member 3)
│   │   ├── middleware/           # Auth validation & error handling
│   │   ├── routes/               # API route mounting
│   │   ├── utils/                # Standardized response & helper utilities
│   │   └── server.js             # Express app entry point
│   └── package.json
│
├── docs/                         # Team Architecture & Strategy Guides
│   ├── ARCHITECTURE.md           # System design, data contracts & 3D bridge
│   ├── API.md                    # REST API endpoint specifications
│   ├── DATABASE.md               # PostgreSQL schema & relationships
│   └── DEVELOPMENT.md            # Git branching, PR rules & conflict prevention
│
├── .gitignore
├── .env.example
└── README.md
```

---

## 📚 Documentation Links
- [System Architecture](docs/ARCHITECTURE.md)
- [REST API Specifications](docs/API.md)
- [Database Schema & Queries](docs/DATABASE.md)
- [Development & Git Workflow](docs/DEVELOPMENT.md)

---

## 🌿 Git Workflow Essentials
- **Branches**:
  - `main`: Production-ready, stable releases.
  - `develop`: Shared integration branch for all pull requests.
  - `feature/member1-world`: Member 1 working branch.
  - `feature/member2-quests`: Member 2 working branch.
  - `feature/member3-backend`: Member 3 working branch.
- Never push directly to `main` or `develop`.
- Always open a Pull Request into `develop`.
