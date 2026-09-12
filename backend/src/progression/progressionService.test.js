import assert from 'node:assert';
import {
  getXpForLevel,
  calculateLevelFromXp,
  calculateRewardsForQuest,
  calculateStreak,
  calculateQuestCompletionProgression,
  calculateRealmLevels,
  calculateDecay,
  REALM_ATTRIBUTE_MAPPING,
} from './progressionService.js';

console.log('--- Running Progression Service Tests ---');

// 1. Test getXpForLevel
assert.strictEqual(getXpForLevel(1), 0, 'Level 1 requires 0 XP');
assert.strictEqual(getXpForLevel(0), 0, 'Level 0 or negative requires 0 XP');
assert.strictEqual(getXpForLevel(-5), 0, 'Negative level requires 0 XP');
assert.strictEqual(getXpForLevel(2), 100, 'Level 2 requires 100 XP (100 * 1^1.5)');
assert.strictEqual(getXpForLevel(3), 282, 'Level 3 requires 282 XP (100 * 2^1.5)');
assert.strictEqual(getXpForLevel(4), 519, 'Level 4 requires 519 XP (100 * 3^1.5)');
console.log('✔ getXpForLevel tests passed');

// 2. Test calculateLevelFromXp
const lvl1 = calculateLevelFromXp(0);
assert.strictEqual(lvl1.level, 1);
assert.strictEqual(lvl1.currentLevelBaseXp, 0);
assert.strictEqual(lvl1.nextLevelXp, 100);
assert.strictEqual(lvl1.progressPercent, 0);

const lvl1Mid = calculateLevelFromXp(50);
assert.strictEqual(lvl1Mid.level, 1);
assert.strictEqual(lvl1Mid.progressPercent, 50);

const lvl2 = calculateLevelFromXp(100);
assert.strictEqual(lvl2.level, 2);
assert.strictEqual(lvl2.currentLevelBaseXp, 100);
assert.strictEqual(lvl2.nextLevelXp, 282);
assert.strictEqual(lvl2.progressPercent, 0);

const lvl3 = calculateLevelFromXp(300);
assert.strictEqual(lvl3.level, 3);
assert.strictEqual(lvl3.currentLevelBaseXp, 282);

// Edge cases
const negativeXp = calculateLevelFromXp(-100);
assert.strictEqual(negativeXp.level, 1);
assert.strictEqual(negativeXp.progressPercent, 0);

const nanXp = calculateLevelFromXp(NaN);
assert.strictEqual(nanXp.level, 1);
console.log('✔ calculateLevelFromXp tests passed');

// 3. Test calculateRewardsForQuest
const easyReward = calculateRewardsForQuest('easy', 'strength');
assert.strictEqual(easyReward.xpReward, 25);
assert.strictEqual(easyReward.goldReward, 10);
assert.strictEqual(easyReward.attributeReward.attribute, 'strength');
assert.strictEqual(easyReward.attributeReward.amount, 1);

const medReward = calculateRewardsForQuest('medium', 'intelligence');
assert.strictEqual(medReward.xpReward, 50);
assert.strictEqual(medReward.goldReward, 25);
assert.strictEqual(medReward.attributeReward.attribute, 'intelligence');
assert.strictEqual(medReward.attributeReward.amount, 2);

const hardReward = calculateRewardsForQuest('hard', 'mind');
assert.strictEqual(hardReward.xpReward, 100);
assert.strictEqual(hardReward.goldReward, 50);
assert.strictEqual(hardReward.attributeReward.attribute, 'intelligence'); // Aliased from mind
assert.strictEqual(hardReward.attributeReward.amount, 4);

const epicReward = calculateRewardsForQuest('epic', 'craft');
assert.strictEqual(epicReward.xpReward, 200);
assert.strictEqual(epicReward.goldReward, 100);
assert.strictEqual(epicReward.attributeReward.attribute, 'creativity'); // Aliased from craft
assert.strictEqual(epicReward.attributeReward.amount, 8);
console.log('✔ calculateRewardsForQuest tests passed');

// 4. Test calculateStreak
// First completion
const firstCompletion = calculateStreak({ currentStreak: 0, lastCompletionDate: null });
assert.strictEqual(firstCompletion.streak, 1);
assert.strictEqual(firstCompletion.streakType, 'first_completion');

// Same-day completion (same calendar day in UTC)
const now = new Date('2026-09-12T14:00:00Z');
const sameDay = calculateStreak({
  currentStreak: 3,
  lastCompletionDate: new Date('2026-09-12T08:00:00Z'),
  currentDate: now,
});
assert.strictEqual(sameDay.streak, 3);
assert.strictEqual(sameDay.streakType, 'same_day');

// Following-day completion (consecutive day)
const nextDay = calculateStreak({
  currentStreak: 3,
  lastCompletionDate: new Date('2026-09-11T18:00:00Z'),
  currentDate: now,
});
assert.strictEqual(nextDay.streak, 4);
assert.strictEqual(nextDay.streakType, 'following_day');

// Missed day completion (reset to 1)
const missedDay = calculateStreak({
  currentStreak: 5,
  lastCompletionDate: new Date('2026-09-09T12:00:00Z'),
  currentDate: now,
});
assert.strictEqual(missedDay.streak, 1);
assert.strictEqual(missedDay.streakType, 'missed_day');
console.log('✔ calculateStreak tests passed');

// 5. Test calculateQuestCompletionProgression
const quest = {
  id: 'q1',
  category: 'strength',
  difficulty: 'medium',
  xp_reward: 50,
  gold_reward: 25,
};

const initialPlayer = {
  level: 1,
  xp: 75,
  streak: 2,
};

const completionResult = calculateQuestCompletionProgression({
  quest,
  playerState: initialPlayer,
  lastCompletionDate: new Date('2026-09-11T12:00:00Z'),
  currentDate: now,
});

assert.strictEqual(completionResult.xpGained, 50);
assert.strictEqual(completionResult.totalXp, 125);
assert.strictEqual(completionResult.level, 2);
assert.strictEqual(completionResult.leveledUp, true);
assert.strictEqual(completionResult.streak, 3);
assert.strictEqual(completionResult.attributePointsAwarded.attribute, 'strength');
assert.strictEqual(completionResult.attributePointsAwarded.amount, 2);
assert.ok(completionResult.realmLevels, 'Completion result must contain realmLevels');
assert.ok('mindLevel' in completionResult.realmLevels, 'realmLevels must contain mindLevel');
assert.ok('bodyLevel' in completionResult.realmLevels, 'realmLevels must contain bodyLevel');
assert.ok('craftLevel' in completionResult.realmLevels, 'realmLevels must contain craftLevel');
console.log('✔ calculateQuestCompletionProgression tests passed');

// 6. Test calculateRealmLevels and REALM_ATTRIBUTE_MAPPING (Steps 7 & 8)
assert.deepStrictEqual(REALM_ATTRIBUTE_MAPPING.mind, ['intelligence', 'wisdom']);
assert.deepStrictEqual(REALM_ATTRIBUTE_MAPPING.body, ['strength', 'discipline']);
assert.deepStrictEqual(REALM_ATTRIBUTE_MAPPING.craft, ['creativity']);

// Base starting stats (all 10)
const baseRealmLevels = calculateRealmLevels({
  intelligence: 10,
  wisdom: 10,
  strength: 10,
  discipline: 10,
  creativity: 10,
});
assert.strictEqual(baseRealmLevels.mindLevel, 1, 'Mind level 1 for 10 avg attribute points');
assert.strictEqual(baseRealmLevels.bodyLevel, 1, 'Body level 1 for 10 avg attribute points');
assert.strictEqual(baseRealmLevels.craftLevel, 1, 'Craft level 1 for 10 creativity attribute points');

// Advanced stats
const advancedRealmLevels = calculateRealmLevels({
  intelligence: 25,
  wisdom: 15, // Mind power = (25 + 15) / 2 = 20 -> Level 2
  strength: 32,
  discipline: 28, // Body power = (32 + 28) / 2 = 30 -> Level 3
  creativity: 44, // Craft power = 44 -> Level 4
});
assert.strictEqual(advancedRealmLevels.mindLevel, 2);
assert.strictEqual(advancedRealmLevels.bodyLevel, 3);
assert.strictEqual(advancedRealmLevels.craftLevel, 4);

// Edge cases (empty / null attributes)
const emptyRealmLevels = calculateRealmLevels(null);
assert.strictEqual(emptyRealmLevels.mindLevel, 1);
assert.strictEqual(emptyRealmLevels.bodyLevel, 1);
assert.strictEqual(emptyRealmLevels.craftLevel, 1);
console.log('✔ calculateRealmLevels tests passed');

// 7. Test calculateDecay (Step 12)
const sampleAttrs = {
  intelligence: 18,
  wisdom: 16,
  strength: 20,
  discipline: 15,
  creativity: 22,
};

// Within grace period (2 days < 3 days grace)
const noDecay = calculateDecay({
  attributes: sampleAttrs,
  lastActiveDate: new Date('2026-09-10T12:00:00Z'),
  currentDate: new Date('2026-09-12T12:00:00Z'),
  graceDays: 3,
});
assert.strictEqual(noDecay.decayApplied, false);
assert.strictEqual(noDecay.pointsDeducted, 0);
assert.strictEqual(noDecay.daysInactive, 2);
assert.strictEqual(noDecay.decayedAttributes.intelligence, 18);

// Beyond grace period (5 days inactive = 2 overdue days * 1 point/day = 2 points deducted per attribute)
const decayed = calculateDecay({
  attributes: sampleAttrs,
  lastActiveDate: new Date('2026-09-07T12:00:00Z'),
  currentDate: new Date('2026-09-12T12:00:00Z'),
  graceDays: 3,
  decayRate: 1,
  minFloor: 10,
});
assert.strictEqual(decayed.decayApplied, true);
assert.strictEqual(decayed.daysInactive, 5);
assert.strictEqual(decayed.decayedAttributes.intelligence, 16);
assert.strictEqual(decayed.decayedAttributes.creativity, 20);

// Protected by minimum floor (cannot decay below 10)
const floorProtection = calculateDecay({
  attributes: { intelligence: 11, wisdom: 10, strength: 10, discipline: 10, creativity: 10 },
  lastActiveDate: new Date('2026-08-01T12:00:00Z'),
  currentDate: new Date('2026-09-12T12:00:00Z'),
  graceDays: 3,
  decayRate: 1,
  minFloor: 10,
});
assert.strictEqual(floorProtection.decayedAttributes.intelligence, 10);
assert.strictEqual(floorProtection.decayedAttributes.wisdom, 10);
assert.strictEqual(floorProtection.decayedAttributes.strength, 10);
console.log('✔ calculateDecay tests passed');

console.log('All progression tests passed successfully!');
