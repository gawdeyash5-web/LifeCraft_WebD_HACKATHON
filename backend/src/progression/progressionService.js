/**
 * Progression Service (Owned by Member 2)
 * Pure helper functions for XP calculations, leveling curve, attribute rewards, and streak tracking.
 * 
 * Rules:
 * - Pure calculations only (zero database imports, zero side effects).
 * - Accepts player state as INPUT, returns updated progression as OUTPUT.
 * - Handles all edge cases (negative numbers, NaN, invalid types, extreme values).
 */

export const VALID_CATEGORIES = ['intelligence', 'strength', 'creativity', 'wisdom', 'discipline'];
export const VALID_DIFFICULTIES = ['easy', 'medium', 'hard', 'epic'];

// Category alias mapping for region-based compatibility
const CATEGORY_MAP = {
  mind: 'intelligence',
  body: 'strength',
  craft: 'creativity',
};

/**
 * Calculates XP threshold required to reach a specific level.
 * Formula: XP = Math.floor(100 * Math.pow(level - 1, 1.5))
 * Level 1 starts at 0 XP.
 * 
 * @param {number} level
 * @returns {number} Required cumulative XP
 */
export const getXpForLevel = (level) => {
  const numericLevel = Math.floor(Number(level) || 0);
  if (numericLevel <= 1) return 0;
  return Math.floor(100 * Math.pow(numericLevel - 1, 1.5));
};

/**
 * Calculates player level from total accumulated XP.
 * 
 * @param {number} totalXp
 * @returns {{ level: number, currentLevelBaseXp: number, nextLevelXp: number, progressPercent: number }}
 */
export const calculateLevelFromXp = (totalXp) => {
  const safeXp = Math.max(0, Math.floor(Number(totalXp) || 0));

  let level = 1;
  const MAX_LEVEL = 1000; // Loop safety guard

  while (level < MAX_LEVEL && safeXp >= getXpForLevel(level + 1)) {
    level++;
  }

  const currentLevelBaseXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const xpNeeded = nextLevelXp - currentLevelBaseXp;

  const progressPercent = xpNeeded > 0
    ? Math.min(100, Math.max(0, Math.floor(((safeXp - currentLevelBaseXp) / xpNeeded) * 100)))
    : 0;

  return {
    level,
    currentLevelBaseXp,
    nextLevelXp,
    progressPercent,
  };
};

/**
 * Calculates XP and Gold rewards based on quest difficulty and category.
 * 
 * Rewards rule:
 * - easy: 25 XP, 10 gold, 1 attribute point
 * - medium: 50 XP, 25 gold, 2 attribute points
 * - hard: 100 XP, 50 gold, 4 attribute points
 * - epic: 200 XP, 100 gold, 8 attribute points
 * 
 * @param {string} difficulty
 * @param {string} category
 * @returns {{ xpReward: number, goldReward: number, attributeReward: { attribute: string, amount: number } }}
 */
export const calculateRewardsForQuest = (difficulty = 'medium', category = 'intelligence') => {
  const multipliers = {
    easy: { xp: 25, gold: 10, attributePoints: 1 },
    medium: { xp: 50, gold: 25, attributePoints: 2 },
    hard: { xp: 100, gold: 50, attributePoints: 4 },
    epic: { xp: 200, gold: 100, attributePoints: 8 },
  };

  const diffKey = String(difficulty || '').toLowerCase().trim();
  const reward = multipliers[diffKey] || multipliers.medium;

  const rawCat = String(category || '').toLowerCase().trim();
  const resolvedCategory = CATEGORY_MAP[rawCat] || (VALID_CATEGORIES.includes(rawCat) ? rawCat : 'intelligence');

  return {
    xpReward: reward.xp,
    goldReward: reward.gold,
    attributeReward: {
      attribute: resolvedCategory,
      amount: reward.attributePoints,
    },
  };
};

/**
 * Pure streak calculation based on calendar days.
 * Distinguishes:
 * - first completion
 * - same-day completion
 * - following-day completion
 * - completion after a missed day
 * 
 * @param {{ currentStreak?: number, lastCompletionDate?: string|Date|null, currentDate?: string|Date }} options
 * @returns {{ streak: number, streakType: 'first_completion' | 'same_day' | 'following_day' | 'missed_day', streakMaintained: boolean }}
 */
export const calculateStreak = ({ currentStreak = 0, lastCompletionDate = null, currentDate = new Date() } = {}) => {
  const streakNum = Math.max(0, parseInt(currentStreak, 10) || 0);

  if (!lastCompletionDate || streakNum === 0) {
    return {
      streak: 1,
      streakType: 'first_completion',
      streakMaintained: true,
    };
  }

  const curr = new Date(currentDate);
  const last = new Date(lastCompletionDate);

  if (isNaN(curr.getTime()) || isNaN(last.getTime())) {
    return {
      streak: Math.max(1, streakNum),
      streakType: 'same_day',
      streakMaintained: true,
    };
  }

  // Compare calendar day difference using UTC days to remain timezone-invariant
  const currUtcDay = Math.floor(Date.UTC(curr.getUTCFullYear(), curr.getUTCMonth(), curr.getUTCDate()) / 86400000);
  const lastUtcDay = Math.floor(Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate()) / 86400000);
  const diffDays = currUtcDay - lastUtcDay;

  if (diffDays <= 0) {
    // Same-day completion (or minor clock drift)
    return {
      streak: Math.max(1, streakNum),
      streakType: 'same_day',
      streakMaintained: true,
    };
  } else if (diffDays === 1) {
    // Following-day consecutive completion
    return {
      streak: streakNum + 1,
      streakType: 'following_day',
      streakMaintained: true,
    };
  } else {
    // Missed one or more calendar days
    return {
      streak: 1,
      streakType: 'missed_day',
      streakMaintained: false,
    };
  }
};

/**
 * Pure quest completion progression orchestrator.
 * Accepts quest and player state as INPUT, returns newly computed progression state as OUTPUT.
 * 
 * @param {{ quest: object, playerState?: object, lastCompletionDate?: string|Date|null, currentDate?: string|Date }} options
 * @returns {{ xpGained: number, totalXp: number, level: number, leveledUp: boolean, attributePointsAwarded: { attribute: string, amount: number }, streak: number, streakType: string, currentLevelBaseXp: number, nextLevelXp: number, progressPercent: number }}
 */
export const calculateQuestCompletionProgression = ({
  quest,
  playerState = {},
  lastCompletionDate = null,
  currentDate = new Date(),
}) => {
  if (!quest) {
    throw new Error('Quest object is required for progression calculation');
  }

  const xpGained = Math.max(0, parseInt(quest.xp_reward ?? quest.xpReward, 10) || 0);
  const currentXp = Math.max(0, parseInt(playerState.xp, 10) || 0);
  const currentLevel = Math.max(1, parseInt(playerState.level, 10) || 1);
  const currentStreak = Math.max(0, parseInt(playerState.streak, 10) || 0);

  const totalXp = currentXp + xpGained;
  const levelInfo = calculateLevelFromXp(totalXp);
  const leveledUp = levelInfo.level > currentLevel;

  // Calculate attribute points from quest definition
  const rewardInfo = calculateRewardsForQuest(quest.difficulty, quest.category);
  const attributePointsAwarded = {
    attribute: rewardInfo.attributeReward.attribute,
    amount: rewardInfo.attributeReward.amount,
  };

  // Pure streak update
  const streakInfo = calculateStreak({
    currentStreak,
    lastCompletionDate,
    currentDate,
  });

  return {
    xpGained,
    totalXp,
    level: levelInfo.level,
    leveledUp,
    attributePointsAwarded,
    streak: streakInfo.streak,
    streakType: streakInfo.streakType,
    currentLevelBaseXp: levelInfo.currentLevelBaseXp,
    nextLevelXp: levelInfo.nextLevelXp,
    progressPercent: levelInfo.progressPercent,
  };
};
