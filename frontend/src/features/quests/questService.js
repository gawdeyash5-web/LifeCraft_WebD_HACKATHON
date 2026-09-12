import { apiRequest } from '../../services/api.js';

/**
 * Quest API Service (Owned by Member 2)
 * Handles client-side API calls for quests and progression.
 * Includes offline-ready mock state fallback for local development or demo resilience.
 */

// Difficulty reward values mirroring backend progressionService
export const DIFFICULTY_REWARDS = {
  easy: { xp: 25, gold: 10, attributePoints: 1 },
  medium: { xp: 50, gold: 25, attributePoints: 2 },
  hard: { xp: 100, gold: 50, attributePoints: 4 },
  epic: { xp: 200, gold: 100, attributePoints: 8 },
};

// Realm to Attribute mapping
export const CATEGORY_ATTRIBUTES = {
  mind: 'intelligence',
  intelligence: 'intelligence',
  body: 'strength',
  strength: 'strength',
  craft: 'creativity',
  creativity: 'creativity',
  wisdom: 'wisdom',
  discipline: 'discipline',
};

// Initial starter quests for seamless fallback demo
const INITIAL_DEMO_QUESTS = [
  {
    id: 'quest-demo-1',
    title: 'Deep Work: Read System Architecture Docs',
    description: 'Study the LIFECRAFT architecture and database specifications for 45 minutes.',
    category: 'intelligence',
    difficulty: 'medium',
    xp_reward: 50,
    gold_reward: 25,
    completed: false,
    completed_at: null,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'quest-demo-2',
    title: 'Physical Vitality: 30 Min HIIT Workout',
    description: 'High intensity interval training to boost strength and endurance.',
    category: 'strength',
    difficulty: 'hard',
    xp_reward: 100,
    gold_reward: 50,
    completed: false,
    completed_at: null,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'quest-demo-3',
    title: 'Creative Coding: Implement Three.js Shader Node',
    description: 'Experiment with glowing neon materials for the 3D world canvas.',
    category: 'creativity',
    difficulty: 'epic',
    xp_reward: 200,
    gold_reward: 100,
    completed: false,
    completed_at: null,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

let localQuestsStore = [...INITIAL_DEMO_QUESTS];

/**
 * Fetch quests from /api/quests with optional query filters.
 */
export async function fetchQuests(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }
    if (filters.completed !== undefined) {
      params.append('completed', filters.completed);
    }
    if (filters.filter) {
      params.append('filter', filters.filter);
    }

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const data = await apiRequest(`/quests${queryStr}`);
    if (Array.isArray(data)) {
      return data;
    }
    return localQuestsStore;
  } catch (err) {
    console.warn('[QuestService] Backend unreachable or unauthenticated, using local state:', err.message);
    let result = [...localQuestsStore];
    if (filters.category && filters.category !== 'all') {
      result = result.filter((q) => q.category === filters.category);
    }
    if (filters.completed !== undefined) {
      result = result.filter((q) => q.completed === filters.completed);
    }
    return result;
  }
}

/**
 * Create a new quest via POST /api/quests.
 */
export async function createQuest(questData) {
  try {
    const data = await apiRequest('/quests', {
      method: 'POST',
      body: JSON.stringify(questData),
    });
    return data;
  } catch (err) {
    console.warn('[QuestService] Creating quest in local fallback mode:', err.message);
    const rewards = DIFFICULTY_REWARDS[questData.difficulty || 'medium'] || DIFFICULTY_REWARDS.medium;
    const resolvedCategory = CATEGORY_ATTRIBUTES[questData.category] || questData.category || 'intelligence';

    const newQuest = {
      id: `quest-local-${Date.now()}`,
      title: questData.title,
      description: questData.description || '',
      category: resolvedCategory,
      difficulty: questData.difficulty || 'medium',
      xp_reward: rewards.xp,
      gold_reward: rewards.gold,
      completed: false,
      completed_at: null,
      created_at: new Date().toISOString(),
    };
    localQuestsStore = [newQuest, ...localQuestsStore];
    return newQuest;
  }
}

/**
 * Update an existing quest via PATCH /api/quests/:id.
 */
export async function updateQuest(id, questData) {
  try {
    const data = await apiRequest(`/quests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(questData),
    });
    return data;
  } catch (err) {
    console.warn('[QuestService] Updating quest in local fallback mode:', err.message);
    const index = localQuestsStore.findIndex((q) => q.id === id);
    if (index !== -1) {
      const existing = localQuestsStore[index];
      const difficulty = questData.difficulty || existing.difficulty;
      const category = questData.category || existing.category;
      const rewards = DIFFICULTY_REWARDS[difficulty] || DIFFICULTY_REWARDS.medium;
      const updated = {
        ...existing,
        ...questData,
        category: CATEGORY_ATTRIBUTES[category] || category,
        difficulty,
        xp_reward: rewards.xp,
        gold_reward: rewards.gold,
      };
      localQuestsStore[index] = updated;
      return updated;
    }
    throw err;
  }
}

/**
 * Delete a quest via DELETE /api/quests/:id.
 */
export async function deleteQuest(id) {
  try {
    await apiRequest(`/quests/${id}`, { method: 'DELETE' });
    localQuestsStore = localQuestsStore.filter((q) => q.id !== id);
    return { id };
  } catch (err) {
    console.warn('[QuestService] Deleting quest from local fallback mode:', err.message);
    localQuestsStore = localQuestsStore.filter((q) => q.id !== id);
    return { id };
  }
}

/**
 * Complete a quest via POST /api/quests/:id/complete.
 * Passes current player state as input to receive calculated progression.
 */
export async function completeQuest(id, playerState = {}) {
  try {
    const data = await apiRequest(`/quests/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ playerState }),
    });
    return data;
  } catch (err) {
    console.warn('[QuestService] Completing quest in local fallback mode:', err.message);
    const index = localQuestsStore.findIndex((q) => q.id === id);
    if (index !== -1) {
      const quest = { ...localQuestsStore[index], completed: true, completed_at: new Date().toISOString() };
      localQuestsStore[index] = quest;

      const xpGained = quest.xp_reward;
      const goldGained = quest.gold_reward;
      const totalXp = (playerState.xp || 0) + xpGained;
      const currentLevel = playerState.level || 1;
      const newLevel = Math.max(1, Math.floor(1 + Math.pow(totalXp / 100, 1 / 1.5)));
      const leveledUp = newLevel > currentLevel;

      const rewards = DIFFICULTY_REWARDS[quest.difficulty] || DIFFICULTY_REWARDS.medium;

      return {
        quest,
        rewardsAwarded: {
          xp: xpGained,
          gold: goldGained,
          attribute: quest.category,
          amount: rewards.attributePoints,
        },
        player: {
          level: newLevel,
          xp: totalXp,
          streak: (playerState.streak || 0) + 1,
          leveledUp,
        },
        progression: {
          xpGained,
          totalXp,
          level: newLevel,
          leveledUp,
          attributePointsAwarded: {
            attribute: quest.category,
            amount: rewards.attributePoints,
          },
          streak: (playerState.streak || 0) + 1,
        },
      };
    }
    throw err;
  }
}
