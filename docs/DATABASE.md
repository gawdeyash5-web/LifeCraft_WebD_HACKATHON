# LIFECRAFT Database Architecture

## 1. Relational Design (PostgreSQL)

The database schema is designed for speed, referential integrity, and clean separation between User accounts, Player RPG progression, Quests, and Inventory.

```
 ┌───────────────┐          ┌───────────────────┐
 │     users     │ 1 ─── 1  │      players      │
 ├───────────────┤          ├───────────────────┤
 │ id (PK)       │          │ id (PK)           │
 │ username      │          │ user_id (FK)      │
 │ email         │          │ level             │
 │ password_hash │          │ xp                │
 │ created_at    │          │ gold              │
 └───────┬───────┘          │ streak            │
         │                  │ intelligence      │
         │ 1                │ strength          │
         │                  │ creativity        │
         │                  │ wisdom            │
         │                  │ discipline        │
         │                  │ unlocked_regions  │
         │                  └───────────────────┘
         │
         │ 1
         ├─── N ──────────┐
         │                │
         ▼                ▼
 ┌───────────────┐ ┌───────────────────┐        ┌───────────────────┐
 │    quests     │ │    inventories    │ N ── 1 │       items       │
 ├───────────────┤ ├───────────────────┤        ├───────────────────┤
 │ id (PK)       │ │ id (PK)           │        │ id (PK)           │
 │ user_id (FK)  │ │ user_id (FK)      │        │ name              │
 │ title         │ │ item_id (FK)      │        │ description       │
 │ description   │ │ is_equipped       │        │ type              │
 │ category      │ │ acquired_at       │        │ price             │
 │ difficulty    │ └───────────────────┘        │ region_target     │
 │ xp_reward     │                              └───────────────────┘
 │ gold_reward   │
 │ completed     │
 │ created_at    │
 └───────────────┘
```

---

## 2. Table Definitions

### 2.1 `users`
Account authentication records.
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 `players`
RPG attributes and progress linked 1:1 with each user.
```sql
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    gold INTEGER NOT NULL DEFAULT 50,
    streak INTEGER NOT NULL DEFAULT 0,
    intelligence INTEGER NOT NULL DEFAULT 10,
    strength INTEGER NOT NULL DEFAULT 10,
    creativity INTEGER NOT NULL DEFAULT 10,
    wisdom INTEGER NOT NULL DEFAULT 10,
    discipline INTEGER NOT NULL DEFAULT 10,
    unlocked_regions TEXT[] NOT NULL DEFAULT ARRAY['mind', 'body', 'craft'],
    active_region VARCHAR(50) DEFAULT 'mind',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 `quests`
Real-world productivity tasks with gamified rewards.
```sql
CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(30) NOT NULL, -- 'intelligence' | 'strength' | 'creativity' | 'wisdom' | 'discipline'
    difficulty VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'easy' | 'medium' | 'hard' | 'epic'
    xp_reward INTEGER NOT NULL DEFAULT 30,
    gold_reward INTEGER NOT NULL DEFAULT 15,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quests_user_status ON quests(user_id, completed);
```

### 2.4 `items`
Catalog of shop cosmetics and unlocks.
```sql
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(30) NOT NULL, -- 'cosmetic' | 'title' | 'buff'
    price INTEGER NOT NULL,
    region_target VARCHAR(50), -- 'mind' | 'body' | 'craft' | 'avatar'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.5 `inventories`
Items owned by users.
```sql
CREATE TABLE inventories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    is_equipped BOOLEAN NOT NULL DEFAULT FALSE,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_id)
);
```

---

## 3. Database Initial Seed
See `backend/src/database/schema.sql` for the ready-to-run setup script that builds these tables and seeds initial items.

## 4. Connection Setup
Configure `DATABASE_URL` in `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lifecraft
```
Member 3 manages the database connection pool using `pg` in `backend/src/database/db.js`.
