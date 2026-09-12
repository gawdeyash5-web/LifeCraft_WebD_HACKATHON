-- ============================================================
-- LIFECRAFT Initial Database Schema (PostgreSQL)
-- Owned by Member 3
-- ============================================================

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table (Authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Players Table (RPG Stats and Attributes)
CREATE TABLE IF NOT EXISTS players (
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

-- 3. Quests Table (Productivity Missions)
CREATE TABLE IF NOT EXISTS quests (
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

CREATE INDEX IF NOT EXISTS idx_quests_user_completed ON quests(user_id, completed);

-- 4. Items Table (Shop Catalog)
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(30) NOT NULL, -- 'cosmetic' | 'title' | 'buff'
    price INTEGER NOT NULL,
    region_target VARCHAR(50), -- 'mind' | 'body' | 'craft' | 'avatar'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Inventories Table (User Purchased Items)
CREATE TABLE IF NOT EXISTS inventories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    is_equipped BOOLEAN NOT NULL DEFAULT FALSE,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_id)
);

-- Initial Starter Items Seed
INSERT INTO items (name, description, type, price, region_target)
VALUES 
  ('Astral Knowledge Orb', 'A shimmering blue orb that hovers over the Mind Island.', 'cosmetic', 100, 'mind'),
  ('Titan Obelisk', 'A towering monolith radiating crimson energy for the Body Island.', 'cosmetic', 150, 'body'),
  ('Cyber Matrix Node', 'An animated wireframe beacon for the Craft & Coding Island.', 'cosmetic', 200, 'craft'),
  ('Crown of Discipline', 'A gold aura that crowns your avatar.', 'cosmetic', 300, 'avatar')
ON CONFLICT DO NOTHING;
