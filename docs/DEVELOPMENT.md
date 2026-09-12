# LIFECRAFT Development & Git Workflow

## 1. Branch Strategy

```
main (Production/Demo Release)
  ▲
  │ (Final stable PR after smoke test)
  │
develop (Integration Branch)
  ▲                  ▲                  ▲
  │ (PR + Review)    │ (PR + Review)    │ (PR + Review)
  │                  │                  │
feature/member1-   feature/member2-   feature/member3-
world              quests             backend
```

### Core Branching Rules
1. **Never commit or push directly to `main`**: `main` is protected and represents final submission-ready code.
2. **Never push directly to `develop`**: `develop` is the shared integration branch. All code must enter via Pull Requests.
3. **Dedicated Feature Branches**:
   - Member 1: `feature/member1-world`
   - Member 2: `feature/member2-quests`
   - Member 3: `feature/member3-backend`

---

## 2. Team File Ownership & Boundaries

To guarantee that 3 developers can sprint in parallel without stepping on each other's toes:

### 🟢 Member 1 Zone (3D World & UI Experience)
- `frontend/src/features/world/*`
- `frontend/src/components/*`
- `frontend/src/styles/*`
*Responsibility*: Visual canvas, Three.js models, camera controls, HUD layouts, aesthetic styling.

### 🟡 Member 2 Zone (Quests & Progression)
- `frontend/src/features/quests/*`
- `backend/src/quests/*`
- `backend/src/progression/*`
*Responsibility*: Quest CRUD UI and endpoints, completion triggers, XP math, leveling curves, streak tracking.

### 🔵 Member 3 Zone (Auth, Player Profile, Economy & Database)
- `frontend/src/features/player/*`
- `frontend/src/features/economy/*`
- `backend/src/auth/*`
- `backend/src/player/*`
- `backend/src/economy/*`
- `backend/src/database/*`
- `backend/src/middleware/authMiddleware.js`
*Responsibility*: Registration, JWT login, PostgreSQL pool & queries, player stats API, shop & inventory management.

---

## 3. ⚠️ "Do Not Touch" Shared Files Policy

The following files are system conduits. Modifying them casually causes merge conflicts:
- `package.json` & `package-lock.json` in root, frontend, and backend (Pre-installed! Do not add random dependencies).
- `frontend/src/main.jsx` & `frontend/src/App.jsx`
- `backend/src/server.js` & `backend/src/routes/index.js`
- `frontend/src/services/api.js`

If you need to change a shared file:
1. Announce it in your team chat.
2. Make a surgical change (e.g. uncomment a mounted route).
3. Push to your branch and coordinate immediate merge into `develop`.

---

## 4. Daily Git Commands Reference

### Starting your work
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Pulling fresh integration changes during development
```bash
git fetch origin
git merge origin/develop
```

### Committing & Pushing
```bash
git add .
git commit -m "feat(quests): add quest completion rewards calculation"
git push origin feature/your-feature-name
```

### Pull Request Checklist
Before creating a PR into `develop`:
- [ ] Code starts locally without crash (`npm run dev`)
- [ ] No hardcoded passwords, tokens, or credentials
- [ ] No extraneous files or unintended `.env` changes committed
- [ ] Ran `npm run build` in `frontend` to ensure Vite bundle passes cleanly
