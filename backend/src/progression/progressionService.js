/**
 * Progression Service (Owned by Member 2)
 * Pure helper functions for XP calculations, leveling curve, and attribute scaling.
 */

/**
 * Calculates XP threshold required to reach a specific level.
 * Formula: XP = Math.floor(100 * Math.pow(level, 1.5))
 */
export const getXpForLevel = (level) => {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level - 1, 1.5));
};

/**
 * Calculates player level from total accumulated XP.
 */
export const calculateLevelFromXp = (totalXp) => {
  let level = 1;
  while (totalXp >= getXpForLevel(level + 1)) {
    level++;
  }
  const currentLevelBaseXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);

  return {
    level,
    currentLevelBaseXp,
    nextLevelXp,
    progressPercent: Math.min(100, Math.floor(((totalXp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100))
  };
};

/**
 * Calculates XP and Gold rewards based on quest difficulty and category
 */
export const calculateRewardsForQuest = (difficulty = 'medium', category = 'intelligence') => {
  const multipliers = {
    easy: { xp: 25, gold: 10, attributePoints: 1 },
    medium: { xp: 50, gold: 25, attributePoints: 2 },
    hard: { xp: 100, gold: 50, attributePoints: 4 },
    epic: { xp: 200, gold: 100, attributePoints: 8 },
  };

  const reward = multipliers[difficulty] || multipliers.medium;

  return {
    xpReward: reward.xp,
    goldReward: reward.gold,
    attributeReward: {
      attribute: category,
      amount: reward.attributePoints,
    }
  };
};
