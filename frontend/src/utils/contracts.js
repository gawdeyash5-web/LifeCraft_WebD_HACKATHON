/**
 * LIFECRAFT Shared Data Contracts & Types
 * 
 * Standardized interfaces for Player, Quests, and Economy.
 */

export const INITIAL_PLAYER_STATE = {
  id: 'local-hero-1',
  username: 'Hero',
  level: 1,
  xp: 35,
  nextLevelXp: 100,
  gold: 75,
  streak: 3,
  attributes: {
    intelligence: 12,
    strength: 10,
    creativity: 14,
    wisdom: 8,
    discipline: 11,
  },
  unlockedRegions: ['mind', 'body', 'craft'],
  activeRegion: 'mind',
};

export const REGIONS = {
  mind: {
    id: 'mind',
    name: 'Mind & Knowledge',
    description: 'Intellectual growth, deep study, reading, and conceptual thinking.',
    attribute: 'intelligence',
    color: '#38bdf8',
  },
  body: {
    id: 'body',
    name: 'Body & Vitality',
    description: 'Physical workouts, cardio endurance, hydration, and nutrition.',
    attribute: 'strength',
    color: '#f87171',
  },
  craft: {
    id: 'craft',
    name: 'Craft & Coding',
    description: 'Software development, building projects, artistic creation, design.',
    attribute: 'creativity',
    color: '#34d399',
  },
};
