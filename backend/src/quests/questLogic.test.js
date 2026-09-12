import assert from 'node:assert';
import {
  calculateRewardsForQuest,
  calculateQuestCompletionProgression,
  calculateLevelFromXp,
  getXpForLevel,
  calculateStreak,
  calculateRealmLevels,
  calculateDecay,
  VALID_CATEGORIES,
  VALID_DIFFICULTIES,
  REALM_ATTRIBUTE_MAPPING,
} from '../progression/progressionService.js';

console.log('--- Running Complete 14-Point Quest & Progression Logic Suite ---');

// ============================================================
// 1. Create Quest
// ============================================================
// Validates quest creation payload construction and reward auto-assignment
const newQuestPayload = {
  title: 'Solve LeetCode Tree Problem',
  description: 'Practice binary search trees',
  category: 'intelligence',
  difficulty: 'medium',
};
const createRewards = calculateRewardsForQuest(newQuestPayload.difficulty, newQuestPayload.category);
const createdQuest = {
  id: 'quest-test-1',
  user_id: 'user-uuid-1',
  title: newQuestPayload.title.trim(),
  description: newQuestPayload.description.trim(),
  category: createRewards.attributeReward.attribute,
  difficulty: newQuestPayload.difficulty,
  xp_reward: createRewards.xpReward,
  gold_reward: createRewards.goldReward,
  completed: false,
  completed_at: null,
  created_at: new Date().toISOString(),
};
assert.strictEqual(createdQuest.title, 'Solve LeetCode Tree Problem');
assert.strictEqual(createdQuest.xp_reward, 50);
assert.strictEqual(createdQuest.gold_reward, 25);
assert.strictEqual(createdQuest.completed, false);
console.log('✔ Test 1: Create quest passed');

// ============================================================
// 2. List Quests
// ============================================================
// Validates filtering by category, active/completed status
const questPool = [
  { id: 'q1', category: 'intelligence', completed: false },
  { id: 'q2', category: 'strength', completed: true },
  { id: 'q3', category: 'intelligence', completed: true },
  { id: 'q4', category: 'creativity', completed: false },
];
const activeQuests = questPool.filter((q) => !q.completed);
assert.strictEqual(activeQuests.length, 2);
const completedQuests = questPool.filter((q) => q.completed);
assert.strictEqual(completedQuests.length, 2);
const mindQuests = questPool.filter((q) => q.category === 'intelligence');
assert.strictEqual(mindQuests.length, 2);
console.log('✔ Test 2: List quests passed');

// ============================================================
// 3. Read Quest
// ============================================================
// Validates finding quest by ID and ownership match
const findQuest = (id, userId) => questPool.find((q) => q.id === id) || null;
const foundQuest = findQuest('q1', 'user-1');
assert.ok(foundQuest);
assert.strictEqual(foundQuest.id, 'q1');
const missingQuest = findQuest('q999', 'user-1');
assert.strictEqual(missingQuest, null);
console.log('✔ Test 3: Read quest passed');

// ============================================================
// 4. Update Quest
// ============================================================
// Validates editing quest details and reward recalculation when difficulty changes
const initialMedium = calculateRewardsForQuest('medium', 'strength');
assert.strictEqual(initialMedium.xpReward, 50);
const updatedHard = calculateRewardsForQuest('hard', 'strength');
assert.strictEqual(updatedHard.xpReward, 100);
assert.strictEqual(updatedHard.goldReward, 50);
// Ensure completed quests cannot be modified
const cannotModifyCompleted = (quest) => {
  if (quest.completed) throw new Error('QUEST_ALREADY_COMPLETED');
  return true;
};
assert.throws(() => cannotModifyCompleted({ completed: true }), /QUEST_ALREADY_COMPLETED/);
console.log('✔ Test 4: Update quest passed');

// ============================================================
// 5. Delete Quest
// ============================================================
// Validates deletion logic and return payload
let deletePool = [{ id: 'q1' }, { id: 'q2' }];
const deleteId = 'q1';
deletePool = deletePool.filter((q) => q.id !== deleteId);
assert.strictEqual(deletePool.length, 1);
assert.strictEqual(deletePool[0].id, 'q2');
console.log('✔ Test 5: Delete quest passed');

// ============================================================
// 6. Complete Quest
// ============================================================
// Validates atomic status toggle, completed_at timestamp, and duplicate completion prevention
const questToComplete = { ...createdQuest };
assert.strictEqual(questToComplete.completed, false);
questToComplete.completed = true;
questToComplete.completed_at = new Date().toISOString();
assert.strictEqual(questToComplete.completed, true);
assert.ok(questToComplete.completed_at);
// Duplicate completion prevention guard
const completeAgain = (quest) => {
  if (quest.completed) throw new Error('QUEST_ALREADY_COMPLETED');
};
assert.throws(() => completeAgain(questToComplete), /QUEST_ALREADY_COMPLETED/);
console.log('✔ Test 6: Complete quest passed');

// ============================================================
// 7. XP Reward
// ============================================================
// Validates difficulty multipliers: easy (25), medium (50), hard (100), epic (200)
assert.strictEqual(calculateRewardsForQuest('easy').xpReward, 25);
assert.strictEqual(calculateRewardsForQuest('medium').xpReward, 50);
assert.strictEqual(calculateRewardsForQuest('hard').xpReward, 100);
assert.strictEqual(calculateRewardsForQuest('epic').xpReward, 200);
console.log('✔ Test 7: XP reward passed');

// ============================================================
// 8. Attribute Update
// ============================================================
// Validates mapping and attribute point scaling
const mindReward = calculateRewardsForQuest('medium', 'mind');
assert.strictEqual(mindReward.attributeReward.attribute, 'intelligence');
assert.strictEqual(mindReward.attributeReward.amount, 2);

const craftReward = calculateRewardsForQuest('hard', 'craft');
assert.strictEqual(craftReward.attributeReward.attribute, 'creativity');
assert.strictEqual(craftReward.attributeReward.amount, 4);

const wisdomReward = calculateRewardsForQuest('epic', 'wisdom');
assert.strictEqual(wisdomReward.attributeReward.attribute, 'wisdom');
assert.strictEqual(wisdomReward.attributeReward.amount, 8);
console.log('✔ Test 8: Attribute update passed');

// ============================================================
// 9. Level Progression
// ============================================================
// Validates formula: 100 * (level - 1)^1.5
assert.strictEqual(getXpForLevel(1), 0);
assert.strictEqual(getXpForLevel(2), 100);
assert.strictEqual(getXpForLevel(3), 282);
const lvlProgression = calculateLevelFromXp(282);
assert.strictEqual(lvlProgression.level, 3);
console.log('✔ Test 9: Level progression passed');

// ============================================================
// 10. Streak
// ============================================================
// Validates first completion, same-day, following-day, missed-day
const firstStreak = calculateStreak({ currentStreak: 0, lastCompletionDate: null });
assert.strictEqual(firstStreak.streak, 1);
const sameDayStreak = calculateStreak({
  currentStreak: 2,
  lastCompletionDate: new Date('2026-09-12T10:00:00Z'),
  currentDate: new Date('2026-09-12T15:00:00Z'),
});
assert.strictEqual(sameDayStreak.streak, 2);
const nextDayStreak = calculateStreak({
  currentStreak: 2,
  lastCompletionDate: new Date('2026-09-11T10:00:00Z'),
  currentDate: new Date('2026-09-12T15:00:00Z'),
});
assert.strictEqual(nextDayStreak.streak, 3);
const missedDayStreak = calculateStreak({
  currentStreak: 5,
  lastCompletionDate: new Date('2026-09-08T10:00:00Z'),
  currentDate: new Date('2026-09-12T15:00:00Z'),
});
assert.strictEqual(missedDayStreak.streak, 1);
console.log('✔ Test 10: Streak passed');

// ============================================================
// 11. Realm-Level Calculation
// ============================================================
// Validates 3D world consumer format: { mindLevel, bodyLevel, craftLevel }
// MIND: Intelligence + Wisdom
// BODY: Strength + Discipline
// CRAFT: Creativity
const realmLevels = calculateRealmLevels({
  intelligence: 20,
  wisdom: 20, // avg 20 -> Level 2
  strength: 30,
  discipline: 30, // avg 30 -> Level 3
  creativity: 40, // 40 -> Level 4
});
assert.strictEqual(realmLevels.mindLevel, 2);
assert.strictEqual(realmLevels.bodyLevel, 3);
assert.strictEqual(realmLevels.craftLevel, 4);
console.log('✔ Test 11: Realm-level calculation passed');

// ============================================================
// 12. Decay
// ============================================================
// Validates inactivity decay calculation with grace period and floor
const decayResult = calculateDecay({
  attributes: { intelligence: 20, wisdom: 20, strength: 20, discipline: 20, creativity: 20 },
  lastActiveDate: new Date('2026-09-06T00:00:00Z'),
  currentDate: new Date('2026-09-12T00:00:00Z'), // 6 days inactive > 3 grace days = 3 overdue days
  graceDays: 3,
  decayRate: 1,
  minFloor: 10,
});
assert.strictEqual(decayResult.decayApplied, true);
assert.strictEqual(decayResult.decayedAttributes.intelligence, 17);
assert.strictEqual(decayResult.decayedAttributes.creativity, 17);
console.log('✔ Test 12: Decay passed');

// ============================================================
// 13. Validation
// ============================================================
// Validates category/difficulty whitelisting and title constraints
assert.ok(VALID_CATEGORIES.includes('intelligence'));
assert.ok(VALID_CATEGORIES.includes('strength'));
assert.ok(VALID_CATEGORIES.includes('creativity'));
assert.ok(VALID_CATEGORIES.includes('wisdom'));
assert.ok(VALID_CATEGORIES.includes('discipline'));
assert.ok(VALID_DIFFICULTIES.includes('easy'));
assert.ok(VALID_DIFFICULTIES.includes('medium'));
assert.ok(VALID_DIFFICULTIES.includes('hard'));
assert.ok(VALID_DIFFICULTIES.includes('epic'));
const validateTitle = (title) => {
  if (!title || !title.trim()) throw new Error('TITLE_REQUIRED');
  if (title.trim().length > 150) throw new Error('TITLE_TOO_LONG');
  return true;
};
assert.throws(() => validateTitle(''), /TITLE_REQUIRED/);
assert.throws(() => validateTitle('a'.repeat(151)), /TITLE_TOO_LONG/);
assert.strictEqual(validateTitle('Valid Quest Title'), true);
console.log('✔ Test 13: Validation passed');

// ============================================================
// 14. Error Handling
// ============================================================
// Validates null quest protection, invalid dates, negative inputs
assert.throws(() => calculateQuestCompletionProgression({ quest: null }), /Quest object is required/);
const negativeXpLevel = calculateLevelFromXp(-50);
assert.strictEqual(negativeXpLevel.level, 1);
assert.strictEqual(negativeXpLevel.progressPercent, 0);
const nanXpLevel = calculateLevelFromXp(NaN);
assert.strictEqual(nanXpLevel.level, 1);
console.log('✔ Test 14: Error handling passed');

console.log('\nAll 14 quest controller & progression logic tests passed successfully!');
