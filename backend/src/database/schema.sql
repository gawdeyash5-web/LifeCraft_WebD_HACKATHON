-- ============================================================
-- LIFECRAFT Production Database Schema (PostgreSQL)
-- Authoritative RPG Persistence Engine
-- ============================================================

-- 1. Users Table (Authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Players Table (RPG Stats, Realm XP, Equipped Cosmetics)
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    gold INTEGER NOT NULL DEFAULT 150,
    streak INTEGER NOT NULL DEFAULT 0,
    intelligence INTEGER NOT NULL DEFAULT 10,
    strength INTEGER NOT NULL DEFAULT 10,
    creativity INTEGER NOT NULL DEFAULT 10,
    wisdom INTEGER NOT NULL DEFAULT 10,
    discipline INTEGER NOT NULL DEFAULT 10,
    mind_xp INTEGER NOT NULL DEFAULT 0,
    body_xp INTEGER NOT NULL DEFAULT 0,
    craft_xp INTEGER NOT NULL DEFAULT 0,
    mind_level INTEGER NOT NULL DEFAULT 1,
    body_level INTEGER NOT NULL DEFAULT 1,
    craft_level INTEGER NOT NULL DEFAULT 1,
    equipped_skin VARCHAR(100) DEFAULT 'character-archer',
    equipped_pet VARCHAR(100) DEFAULT NULL,
    equipped_decor VARCHAR(100) DEFAULT NULL,
    mastery_expansions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    unlocked_regions TEXT[] NOT NULL DEFAULT ARRAY['mind', 'body', 'craft'],
    active_region VARCHAR(50) DEFAULT 'mind',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Quests Table (Productivity Missions & Mastery Side Quests)
CREATE TABLE IF NOT EXISTS quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(30) NOT NULL, -- 'intelligence' | 'strength' | 'creativity' | 'wisdom' | 'discipline'
    difficulty VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'easy' | 'medium' | 'hard' | 'epic'
    xp_reward INTEGER NOT NULL DEFAULT 50,
    gold_reward INTEGER NOT NULL DEFAULT 25,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    is_mastery_quest BOOLEAN NOT NULL DEFAULT FALSE,
    realm_target VARCHAR(30) DEFAULT NULL, -- 'mind' | 'body' | 'craft'
    expansion_reward VARCHAR(50) DEFAULT NULL, -- 'mind_library' | 'body_coliseum' | 'craft_foundry'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quests_user_completed ON quests(user_id, completed);

-- 4. Items Table (Cosmetic Shop Catalog)
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(30) NOT NULL, -- 'skin' | 'pet' | 'decor' | 'theme'
    slot VARCHAR(30) NOT NULL, -- 'skin' | 'pet' | 'decor' | 'theme'
    price INTEGER NOT NULL,
    region_target VARCHAR(50), -- 'mind' | 'body' | 'craft' | 'avatar' | 'world'
    asset_key VARCHAR(100) UNIQUE NOT NULL, -- Canonical unique key used by 3D canvas to mount model
    rarity VARCHAR(20) DEFAULT 'rare', -- 'common' | 'rare' | 'epic' | 'legendary'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Inventories Table (User Purchased Items & Equipped State)
CREATE TABLE IF NOT EXISTS inventories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    is_equipped BOOLEAN NOT NULL DEFAULT FALSE,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_id)
);

-- 6. Achievements Catalog Table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(30) NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 50,
    gold_reward INTEGER NOT NULL DEFAULT 25,
    icon VARCHAR(50) DEFAULT 'Trophy'
);

-- 7. User Unlocked Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_key VARCHAR(50) NOT NULL REFERENCES achievements(key) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_key)
);

-- 8. Player Events Table (Chronological Log)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_user_time ON events(user_id, created_at DESC);

-- ============================================================
-- Seed Catalog Items (Cosmetics with real 3D assets)
-- ============================================================
INSERT INTO items (name, description, category, slot, price, region_target, asset_key, rarity)
VALUES 
  -- 1. Pets (Companion pets following player in 3D diorama)
  ('Astral Fox', 'A mystical spectral fox that journeys by your side.', 'pet', 'pet', 50, 'avatar', 'animal-fox', 'epic'),
  ('War Lion', 'A noble lion companion representing relentless physical drive.', 'pet', 'pet', 75, 'avatar', 'animal-lion', 'legendary'),
  ('Tinkerer Panda', 'A resourceful companion observing your craft and architecture.', 'pet', 'pet', 60, 'avatar', 'animal-panda', 'rare'),
  ('Arcane Familiar Cat', 'A wise, curious feline tuned to cosmic knowledge.', 'pet', 'pet', 45, 'avatar', 'animal-cat', 'rare'),

  -- 2. Character Skins (Visual outfit variants for PlayerModel)
  ('Sage Wanderer', 'Robes of the deep scholar, attuned to arcane discovery.', 'skin', 'skin', 80, 'avatar', 'character-oobi', 'epic'),
  ('Champion Knight', 'Tempered iron armor forged for unwavering vitality.', 'skin', 'skin', 90, 'avatar', 'character-oodi', 'legendary'),
  ('Artisan Crafter', 'Gilded tunic equipped with tools for creative mastery.', 'skin', 'skin', 70, 'avatar', 'character-ooli', 'rare'),

  -- 3. World Decor (Interactive 3D props spawning in realm or plaza)
  ('Grand Plaza Fountain', 'A stunning marble fountain radiating vitality in the central hub.', 'decor', 'decor', 60, 'world', 'fountain-round-detail', 'epic'),
  ('Banners of Valor', 'Crimson heraldic banners mounted along realm bridges.', 'decor', 'decor', 40, 'body', 'banner-red', 'rare'),
  ('Academy Lore Banners', 'Emerald knowledge crests decorating the Mind sanctuary.', 'decor', 'decor', 40, 'mind', 'banner-green', 'rare'),
  ('Artisan Market Stall', 'A vibrant trade stall showcasing engineering inventions.', 'decor', 'decor', 55, 'craft', 'stall-red', 'rare')
ON CONFLICT (asset_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  slot = EXCLUDED.slot,
  price = EXCLUDED.price,
  region_target = EXCLUDED.region_target,
  rarity = EXCLUDED.rarity;

-- ============================================================
-- Seed Achievements Catalog
-- ============================================================
INSERT INTO achievements (key, title, description, category, xp_reward, gold_reward, icon)
VALUES
  ('first_quest', 'First Steps', 'Complete your very first real-life quest.', 'quest', 50, 25, 'Compass'),
  ('getting_started', 'Realm Initiate', 'Earn your first realm XP in any discipline.', 'realm', 50, 25, 'Sparkles'),
  ('rising_adventurer', 'Rising Adventurer', 'Ascend to Player Level 2 through consistent action.', 'progression', 100, 50, 'Shield'),
  ('wealth_builder', 'Treasure Keeper', 'Amass 200 or more Gold in your purse.', 'economy', 80, 40, 'Coins'),
  ('collector', 'Curator of Realms', 'Acquire your first cosmetic companion or skin from the shop.', 'economy', 75, 50, 'ShoppingBag'),
  ('mind_initiate', 'Seeker of Wisdom', 'Elevate the Mind Sanctuary to Level 2.', 'realm', 150, 75, 'Brain'),
  ('body_initiate', 'Iron Resolve', 'Elevate the Body Arena to Level 2.', 'realm', 150, 75, 'Dumbbell'),
  ('craft_initiate', 'Master Builder', 'Elevate the Craft Workshop to Level 2.', 'realm', 150, 75, 'Code2'),
  ('realm_master', 'Realm Master', 'Reach Level 3 mastery in any realm to unlock world expansions.', 'mastery', 250, 150, 'Crown'),
  ('streak_keeper', 'Unbroken Momentum', 'Maintain a quest streak of 3 or more days.', 'streak', 100, 50, 'Flame')
ON CONFLICT DO NOTHING;
