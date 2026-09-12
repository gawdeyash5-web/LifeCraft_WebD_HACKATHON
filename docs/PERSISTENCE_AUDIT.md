# LIFECRAFT System & Persistence Audit Report
**Target**: Complete Production System Integration  
**Date**: September 13, 2026  
**Commit Baseline**: `dc73a1b`  

---

## 1. Executive Summary

A comprehensive architectural audit was conducted across the authentication, database, player, economy, quest progression, and 3D diorama systems. The application contains high-quality modular implementations from all three team members, but several end-to-end flows remain disconnected or rely on optimistic local state. 

This document details the gaps, mock data, broken flows, and the concrete implementation plan required to transform LIFECRAFT into a fully persistent, authoritative RPG system.

---

## 2. Component-by-Component Audit

### 2.1 Database & Persistence Engine
- **Current State**: `backend/src/database/db.js` relies on `pg.Pool` connecting to `process.env.DATABASE_URL` (`localhost:5432`). If no native PostgreSQL server daemon is active on the host, all database queries time out or throw `ECONNREFUSED`.
- **Genuinely Persistent**: SQL definitions in `schema.sql` (tables: `users`, `players`, `quests`, `items`, `inventories`).
- **Gaps / Broken Flows**:
  1. No fallback embedded relational engine. Installing and configuring `@electric-sql/pglite` provides a zero-dependency, pure WASM PostgreSQL 16 engine that writes directly to `./data/lifecraft_pg`, enabling 100% genuine ACID SQL persistence in any environment.
  2. `schema.sql` lacks columns for realm XP (`mind_xp`, `body_xp`, `craft_xp`), equipped cosmetics slots (`equipped_skin`, `equipped_pet`, `equipped_decor`), realm mastery expansions (`mastery_expansions TEXT[]`), and an `achievements` table.

### 2.2 Authentication & User Session
- **Current State**: `authController.js` hashes passwords with `bcryptjs` and signs JWTs. `AuthModal.jsx` stores tokens in `localStorage`.
- **Genuinely Persistent**: User records and password hashes in the database.
- **Gaps / Broken Flows**:
  1. On browser refresh, `App.jsx` mounts with hardcoded demo player stats (`level: 12, xp: 420, gold: 840, username: 'Yash'`). It does **not** call `GET /api/player/profile` on application mount to hydrate the authenticated user's real persisted stats.
  2. Logging in updates token in `localStorage`, but does not trigger a global player state re-fetch in `App.jsx`.

### 2.3 Quests, XP & Progression
- **Current State**: `questController.js` handles quest CRUD, and `progressionService.js` calculates level/XP rewards.
- **Genuinely Persistent**: Quest rows in the `quests` table.
- **Mocked / Frontend-Only**:
  1. In `questController.js` line 17: *"Does NOT read, update, or persist to the `players` table"*. When a quest is completed on the backend, the player's XP, Gold, and attribute points in the `players` table are **never updated**.
  2. `App.jsx` simulates quest completion via optimistic React state (`handleCompleteQuest`), which vanishes upon browser reload.
  3. Quests currently reward generic XP and Gold, but do not update realm-specific XP (`mind_xp`, `body_xp`, `craft_xp`).

### 2.4 Shop, Inventory & Economy
- **Current State**: `economyController.js` has `buyItem` with an atomic transaction (`BEGIN`, `SELECT FOR UPDATE`, gold deduction, `INSERT INTO inventories`).
- **Genuinely Persistent**: Catalog lookup and inventory rows when database is reachable.
- **Gaps / Broken Flows**:
  1. No backend endpoint for **Equip / Unequip**: `inventories` has `is_equipped`, but there is no `PATCH /api/economy/inventory/:id/equip` route.
  2. No cosmetic category handling: items lack equip slots (e.g. `pet`, `skin`, `decor`, `theme`).
  3. The 3D world canvas does not read equipped items or spawn cosmetics.
  4. Guest mode in `ShopPlaceholder.jsx` stores items in component-level React state that resets on refresh.

### 2.5 Achievements
- **Current State**: `SidebarNav.jsx` and `BottomRealmDock.jsx` have an "Achievements" tab button (`activeTab === 'achievements'`), but clicking it displays nothing.
- **Gaps**:
  1. No `achievements` table in database schema.
  2. No achievement service or evaluation triggers on quest completion or purchases.
  3. No modal or drawer panel rendering achievements.

### 2.6 Realm Progression & Mastered Realm Expansion
- **Current State**: Realm evolution (Level 1, 2, 3) is driven by `useRealmLevels.js`, which was manually toggled via `RealmEvolutionDevBar.jsx`.
- **Gaps**:
  1. Realm level is not derived from persisted realm XP.
  2. `RealmEvolutionDevBar.jsx` is present in the production UI.
  3. No mastery side quests exist when a realm reaches Level 3.
  4. No world expansion zones are unlocked upon completing mastery quests.

### 2.7 User-Facing Internal / Developer Copy
- The following internal labels exist in production components:
  - `QuestPanel.jsx`: *"Progression slice • Member 2"*
  - `ShopPlaceholder.jsx`: *"Owned by Member 3"*, *"Integrated with PostgreSQL"*
  - `PlayerStatsPlaceholder.jsx`: *"Owned by Member 3"*, *"Integrated with PostgreSQL"*
  - `RealmEvolutionDevBar.jsx`: Development test controls.

---

## 3. Actionable Integration Roadmap

1. **Database Adapter Upgrade**:
   - Update `backend/src/database/db.js` with dual-mode support: auto-connects to PostgreSQL if available, or utilizes embedded WASM PGlite writing to `./data/lifecraft_pg`.
   - Update `schema.sql` with realm XP, equipped cosmetic slots, realm mastery expansions, and `achievements` table.
2. **Authoritative Player & Quest Synchronization**:
   - Update `questController.js` to atomically update the `players` table (XP, gold, realm XP, streak, attribute points) inside a transaction upon quest completion.
   - Add `GET /api/player/profile` hydration on frontend startup.
3. **Cosmetics & Equip System**:
   - Add rich cosmetics to catalog (character skins, companion pets, world decor, realm themes) using assets from `assets_lib/`.
   - Implement `PATCH /api/economy/inventory/:id/equip` and `unequip`.
   - Connect equipped cosmetics to `WorldScene.jsx` (companion pet following player, active decor).
4. **Achievements Engine**:
   - Implement `backend/src/achievements/` with evaluation rules (First Quest, Level 5, Collector, Realm Master, etc.).
   - Create `AchievementsModal.jsx` displaying unlocked/locked status, criteria, and rewards.
5. **Realm Evolution & Mastery Side Quests**:
   - Derive realm levels purely from realm XP:
     - Level 1: 0 - 99 XP
     - Level 2: 100 - 249 XP
     - Level 3: 250+ XP (Mastery)
   - Unlock mastery side quests at Level 3 that persist world expansions in `players.mastery_expansions`.
   - Remove `RealmEvolutionDevBar.jsx`.
6. **UI Polish**:
   - Remove all internal developer and team ownership labels.
