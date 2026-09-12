# LIFECRAFT Architecture & Technical Design

## 1. Executive Overview
LIFECRAFT bridges real-life task completion with a gamified 3D virtual environment. The system follows a decoupled, service-oriented monolithic architecture designed specifically for a 3-person team under tight hackathon time constraints (8 hours).

```
   ┌─────────────────────────────────────────────────────────┐
   │                    Client (Vite + React)                │
   │                                                         │
   │   ┌─────────────────────┐       ┌───────────────────┐   │
   │   │   HUD & 2D Panels   │       │   3D Canvas (R3F) │   │
   │   │  (Quests/Shop/Stats)│◄─────►│(Interactive World)│   │
   │   └──────────┬──────────┘       └─────────▲─────────┘   │
   │              │                            │             │
   │              ▼                            │             │
   │       App State Store / Context ──────────┘             │
   │              │                                          │
   │              │ HTTP / REST                              │
   └──────────────┼──────────────────────────────────────────┘
                  ▼
   ┌─────────────────────────────────────────────────────────┐
   │                 Backend (Node.js + Express)             │
   │                                                         │
   │  ┌──────────────┐  ┌───────────────┐  ┌───────────────┐ │
   │  │ Auth & Player│  │ Quests & XP   │  │ Shop & Items  │ │
   │  └──────┬───────┘  └───────┬───────┘  └───────┬───────┘ │
   │         │                  │                  │         │
   │         └──────────────────┼──────────────────┘         │
   │                            ▼                            │
   │                     PostgreSQL Database                 │
   └─────────────────────────────────────────────────────────┘
```

---

## 2. Shared Data Contracts

All three developers must strictly align on the schema of core objects to avoid serialization mismatches.

### 2.1 Player State Contract
```json
{
  "id": "uuid-v4",
  "username": "DragonSlayer",
  "level": 4,
  "xp": 350,
  "nextLevelXp": 500,
  "gold": 120,
  "streak": 5,
  "attributes": {
    "intelligence": 18,
    "strength": 12,
    "creativity": 14,
    "wisdom": 10,
    "discipline": 16
  },
  "unlockedRegions": ["mind", "body", "craft"],
  "activeRegion": "mind",
  "avatar": {
    "color": "#6366f1",
    "accessory": "crown"
  }
}
```

### 2.2 Quest Contract
```json
{
  "id": "uuid-v4",
  "userId": "uuid-v4",
  "title": "Study Algorithms for 45 mins",
  "description": "Complete 2 LeetCode problems on Dynamic Programming",
  "category": "intelligence", // 'intelligence' | 'strength' | 'creativity' | 'wisdom' | 'discipline'
  "difficulty": "medium",    // 'easy' | 'medium' | 'hard' | 'epic'
  "xpReward": 60,
  "goldReward": 25,
  "attributeReward": {
    "attribute": "intelligence",
    "amount": 2
  },
  "completed": false,
  "completedAt": null,
  "createdAt": "2026-09-12T10:00:00Z"
}
```

### 2.3 Economy Contract
```json
{
  "id": "uuid-v4",
  "name": "Knowledge Crystal",
  "description": "Floating glowing crystal over the Mind region.",
  "type": "cosmetic",        // 'cosmetic' | 'title' | 'buff'
  "price": 100,
  "regionTarget": "mind",
  "icon": "crystal"
}
```

---

## 3. The 3D World Interaction Layer (Member 1)

### 3.1 Design Principles
- **Separation of Concerns:** The 3D scene (`frontend/src/features/world/`) is purely a **reactive visual representation**. It consumes state and dispatches user click events; it contains **zero business or progression logic**.
- **Low-Poly / Stylized:** Avoid complex textures or heavy meshes. Use Three.js primitives (`CylinderGeometry`, `BoxGeometry`, `SphereGeometry`, `DodecahedronGeometry`) with vibrant stylized materials (`meshStandardMaterial` with emissive highlights).
- **Regions Map:**
  1. **Center:** Player avatar pedestal.
  2. **Mind / Knowledge Island:** Books, floating geometry, blue/cyan lighting.
  3. **Body / Physical Island:** Gym/monolith stone pillars, red/amber lighting.
  4. **Craft / Coding Island:** Futuristic cyber blocks, green/emerald lighting.

### 3.2 Interaction Mechanism
1. User clicks a 3D Island node.
2. `onPointerDown` triggers a camera lerp/focus towards that island.
3. The parent state updates `activeRegion: 'mind'`, which highlights corresponding stats or filtered quests in the 2D HUD.

---

## 4. Module Boundaries & Anti-Conflict Rules

| Team Member | Subsystem | Code Folders Assigned | Shared Points to Coordinate |
| :--- | :--- | :--- | :--- |
| **Member 1** | 3D World & Global UI | `frontend/src/features/world/`<br>`frontend/src/components/`<br>`frontend/src/styles/` | `App.jsx` layout wrapper (Member 1 defines visual framing). |
| **Member 2** | Quests & XP Engine | `frontend/src/features/quests/`<br>`backend/src/quests/`<br>`backend/src/progression/` | Calls Player Service when quest completes to award XP/Gold. |
| **Member 3** | Auth, Profile, Economy & DB | `frontend/src/features/player/`<br>`frontend/src/features/economy/`<br>`backend/src/auth/`<br>`backend/src/player/`<br>`backend/src/economy/`<br>`backend/src/database/` | Provides database client and authenticated user middleware. |

---

## 5. Non-Linear Progression Math (Hackathon Formula)
Member 2 will implement the progression logic in `backend/src/progression/progressionService.js`:
$$\text{XP Required for Level } L = 100 \times L^{1.5}$$
- Level 1: 0 - 100 XP
- Level 2: 100 - 382 XP
- Level 3: 382 - 820 XP
- Level 4: 820 - 1400 XP
- Upon level-up: notify client with `{ leveledUp: true, newLevel: L, unlockedRewards: [...] }`.
