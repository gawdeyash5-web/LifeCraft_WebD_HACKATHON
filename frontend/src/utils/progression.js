/**
 * LIFECRAFT Client-Side Authoritative Progression Utilities
 * Mirrors backend progressionService exactly to guarantee consistent leveling rules.
 */

export const getXpForLevel = (level) => {
  const numericLevel = Math.floor(Number(level) || 0);
  if (numericLevel <= 1) return 0;
  return Math.floor(100 * Math.pow(numericLevel - 1, 1.5));
};

export const calculateLevelProgression = (totalXp) => {
  const safeXp = Math.max(0, Math.floor(Number(totalXp) || 0));

  let level = 1;
  const MAX_LEVEL = 1000;

  while (level < MAX_LEVEL && safeXp >= getXpForLevel(level + 1)) {
    level++;
  }

  const currentLevelBaseXp = getXpForLevel(level);
  const nextLevelBaseXp = getXpForLevel(level + 1);
  const nextLevelThreshold = nextLevelBaseXp - currentLevelBaseXp;
  const currentLevelXp = safeXp - currentLevelBaseXp;

  const progressPercent = nextLevelThreshold > 0
    ? Math.min(100, Math.max(0, Math.floor((currentLevelXp / nextLevelThreshold) * 100)))
    : 0;

  return {
    level,
    totalXp: safeXp,
    currentLevelXp,
    nextLevelThreshold,
    currentLevelBaseXp,
    nextLevelBaseXp,
    progressPercent,
  };
};
