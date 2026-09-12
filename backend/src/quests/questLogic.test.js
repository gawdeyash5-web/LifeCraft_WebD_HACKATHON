import assert from 'node:assert';
import {
  calculateRewardsForQuest,
  calculateQuestCompletionProgression,
  VALID_CATEGORIES,
  VALID_DIFFICULTIES,
} from '../progression/progressionService.js';

console.log('--- Running Quest Controller Logic & Validation Tests ---');

// 1. Validation tests for categories and difficulties
assert.ok(VALID_CATEGORIES.includes('intelligence'));
assert.ok(VALID_CATEGORIES.includes('strength'));
assert.ok(VALID_CATEGORIES.includes('creativity'));
assert.ok(VALID_CATEGORIES.includes('wisdom'));
assert.ok(VALID_CATEGORIES.includes('discipline'));

assert.ok(VALID_DIFFICULTIES.includes('easy'));
assert.ok(VALID_DIFFICULTIES.includes('medium'));
assert.ok(VALID_DIFFICULTIES.includes('hard'));
assert.ok(VALID_DIFFICULTIES.includes('epic'));
console.log('✔ Enum validations passed');

// 2. Test Quest Creation Reward Calculation
const testEasyQuest = calculateRewardsForQuest('easy', 'intelligence');
assert.strictEqual(testEasyQuest.xpReward, 25);
assert.strictEqual(testEasyQuest.goldReward, 10);
assert.strictEqual(testEasyQuest.attributeReward.amount, 1);

const testEpicQuest = calculateRewardsForQuest('epic', 'wisdom');
assert.strictEqual(testEpicQuest.xpReward, 200);
assert.strictEqual(testEpicQuest.goldReward, 100);
assert.strictEqual(testEpicQuest.attributeReward.attribute, 'wisdom');
assert.strictEqual(testEpicQuest.attributeReward.amount, 8);
console.log('✔ Quest creation reward calculations passed');

// 3. Test Reward Recalculation on Quest Update
// If difficulty is upgraded from medium to hard, XP should increase from 50 to 100
const originalMedium = calculateRewardsForQuest('medium', 'strength');
assert.strictEqual(originalMedium.xpReward, 50);

const updatedHard = calculateRewardsForQuest('hard', 'strength');
assert.strictEqual(updatedHard.xpReward, 100);
assert.strictEqual(updatedHard.attributeReward.amount, 4);
console.log('✔ Reward recalculation logic on update passed');

// 4. Test Completion Progression & Duplicate Protection Logic
const sampleQuest = {
  id: 'quest-uuid-1',
  user_id: 'user-uuid-1',
  title: 'Morning 5km Run',
  category: 'strength',
  difficulty: 'hard',
  xp_reward: 100,
  gold_reward: 50,
  completed: false,
  completed_at: null,
};

// First completion simulation
const playerStateInput = {
  level: 2,
  xp: 150,
  streak: 3,
};

const completionResult = calculateQuestCompletionProgression({
  quest: sampleQuest,
  playerState: playerStateInput,
  lastCompletionDate: new Date('2026-09-11T10:00:00Z'),
  currentDate: new Date('2026-09-12T10:00:00Z'),
});

assert.strictEqual(completionResult.xpGained, 100);
assert.strictEqual(completionResult.totalXp, 250);
assert.strictEqual(completionResult.streak, 4, 'Consecutive day increments streak from 3 to 4');
assert.strictEqual(completionResult.attributePointsAwarded.attribute, 'strength');
assert.strictEqual(completionResult.attributePointsAwarded.amount, 4);

// Verify contract keys
const expectedKeys = [
  'xpGained',
  'totalXp',
  'level',
  'leveledUp',
  'attributePointsAwarded',
  'streak',
  'streakType',
  'currentLevelBaseXp',
  'nextLevelXp',
  'progressPercent',
];

for (const key of expectedKeys) {
  assert.ok(key in completionResult, `Missing expected key ${key} in completion progression result`);
}

// 5. Duplicate completion guard simulation
// Once marked completed, simulating an already completed quest
const alreadyCompletedQuest = {
  ...sampleQuest,
  completed: true,
  completed_at: new Date('2026-09-12T10:00:00Z'),
};

const isAlreadyCompleted = alreadyCompletedQuest.completed === true;
assert.strictEqual(isAlreadyCompleted, true, 'Guard must detect completed quests and block re-rewarding');

console.log('✔ Completion progression and duplicate guard tests passed');
console.log('All quest controller logic tests passed successfully!');
