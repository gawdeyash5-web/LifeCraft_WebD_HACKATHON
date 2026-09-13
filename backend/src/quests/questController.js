import { successResponse, errorResponse } from '../utils/response.js';
import {
  calculateRewardsForQuest,
  calculateLevelFromXp,
  calculateStreak,
  VALID_CATEGORIES,
  VALID_DIFFICULTIES,
} from '../progression/progressionService.js';
import { query, getClient } from '../database/db.js';
import { evaluateAchievements } from '../achievements/achievementService.js';

/**
 * Quest Controller
 * Handles Quest CRUD, authoritative completion, atomic player stat persistence,
 * realm XP tracking, realm evolution calculations, and mastery side quests.
 */

// Helper to reliably extract authenticated user ID
const getAuthUserId = (req) => {
  return req.user?.id || req.user?.userId || req.user?.sub;
};

// Map category to 3D living diorama realm
const CATEGORY_TO_REALM = {
  intelligence: 'mind',
  strength: 'body',
  creativity: 'craft',
  wisdom: 'mind',
  discipline: 'body',
};

// Calculate realm level strictly from accumulated realm XP
const getRealmLevelFromXp = (realmXp = 0) => {
  if (realmXp >= 250) return 3;
  if (realmXp >= 100) return 2;
  return 1;
};

/**
 * GET /api/quests
 * List all quests for the authenticated user, with optional filtering.
 */
export const listQuests = async (req, res, next) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return errorResponse(res, 'User ID not found in authentication token', 401, 'UNAUTHORIZED');
    }

    const { category, completed, filter } = req.query;
    const params = [userId];
    let sql = 'SELECT * FROM quests WHERE user_id = $1';

    // Optional category filter
    if (category && category !== 'all') {
      params.push(String(category).toLowerCase().trim());
      sql += ` AND category = $${params.length}`;
    }

    // Optional completion filter: supports ?completed=true|false or ?filter=active|completed
    if (completed !== undefined) {
      const isCompleted = completed === 'true' || completed === true;
      params.push(isCompleted);
      sql += ` AND completed = $${params.length}`;
    } else if (filter === 'active') {
      params.push(false);
      sql += ` AND completed = $${params.length}`;
    } else if (filter === 'completed') {
      params.push(true);
      sql += ` AND completed = $${params.length}`;
    }

    sql += ' ORDER BY is_mastery_quest DESC, created_at DESC';

    const { rows } = await query(sql, params);
    return successResponse(res, rows, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/quests/:id
 * Retrieve a single quest belonging to the authenticated user.
 */
export const getQuestById = async (req, res, next) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return errorResponse(res, 'User ID not found in authentication token', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    const { rows } = await query('SELECT * FROM quests WHERE id = $1 AND user_id = $2', [id, userId]);

    if (rows.length === 0) {
      return errorResponse(res, 'Quest not found', 404, 'NOT_FOUND');
    }

    return successResponse(res, rows[0], 200);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/quests
 * Create a new quest for the authenticated user.
 */
export const createQuest = async (req, res, next) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return errorResponse(res, 'User ID not found in authentication token', 401, 'UNAUTHORIZED');
    }

    const { title, description, category, difficulty } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || !title.trim()) {
      return errorResponse(res, 'Title is required and must be a non-empty string', 400, 'VALIDATION_ERROR');
    }

    if (title.trim().length > 150) {
      return errorResponse(res, 'Title must not exceed 150 characters', 400, 'VALIDATION_ERROR');
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      return errorResponse(res, 'Category is required', 400, 'VALIDATION_ERROR');
    }

    const rawCategory = category.toLowerCase().trim();
    const rawDifficulty = difficulty ? String(difficulty).toLowerCase().trim() : 'medium';

    // Calculate rewards using pure progressionService
    const rewards = calculateRewardsForQuest(rawDifficulty, rawCategory);
    const resolvedCategory = rewards.attributeReward.attribute;
    const resolvedDifficulty = VALID_DIFFICULTIES.includes(rawDifficulty) ? rawDifficulty : 'medium';
    const targetRealm = CATEGORY_TO_REALM[resolvedCategory] || 'mind';

    const insertSql = `
      INSERT INTO quests (user_id, title, description, category, difficulty, xp_reward, gold_reward, realm_target)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const { rows } = await query(insertSql, [
      userId,
      title.trim(),
      description ? String(description).trim() : null,
      resolvedCategory,
      resolvedDifficulty,
      rewards.xpReward,
      rewards.goldReward,
      targetRealm,
    ]);

    return successResponse(res, rows[0], 201, 'Quest created successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/quests/:id
 * Update a quest owned by the authenticated user.
 */
export const updateQuest = async (req, res, next) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return errorResponse(res, 'User ID not found in authentication token', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    const { title, description, category, difficulty } = req.body;

    const { rows: currentRows } = await query(
      'SELECT * FROM quests WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (currentRows.length === 0) {
      return errorResponse(res, 'Quest not found', 404, 'NOT_FOUND');
    }

    const currentQuest = currentRows[0];
    if (currentQuest.completed) {
      return errorResponse(res, 'Cannot edit a completed quest', 400, 'QUEST_ALREADY_COMPLETED');
    }

    const updatedTitle = title !== undefined ? String(title).trim() : currentQuest.title;
    const updatedDescription = description !== undefined
      ? (description ? String(description).trim() : null)
      : currentQuest.description;

    const targetCategory = category !== undefined ? String(category).toLowerCase().trim() : currentQuest.category;
    const targetDifficulty = difficulty !== undefined ? String(difficulty).toLowerCase().trim() : currentQuest.difficulty;

    const rewards = calculateRewardsForQuest(targetDifficulty, targetCategory);
    const resolvedCategory = rewards.attributeReward.attribute;
    const resolvedDifficulty = VALID_DIFFICULTIES.includes(targetDifficulty) ? targetDifficulty : currentQuest.difficulty;
    const targetRealm = CATEGORY_TO_REALM[resolvedCategory] || currentQuest.realm_target || 'mind';

    const updateSql = `
      UPDATE quests
      SET title = $1, description = $2, category = $3, difficulty = $4, xp_reward = $5, gold_reward = $6, realm_target = $7
      WHERE id = $8 AND user_id = $9
      RETURNING *
    `;

    const { rows: updatedRows } = await query(updateSql, [
      updatedTitle,
      updatedDescription,
      resolvedCategory,
      resolvedDifficulty,
      rewards.xpReward,
      rewards.goldReward,
      targetRealm,
      id,
      userId,
    ]);

    return successResponse(res, updatedRows[0], 200, 'Quest updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/quests/:id
 * Delete a quest owned by the authenticated user.
 */
export const deleteQuest = async (req, res, next) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return errorResponse(res, 'User ID not found in authentication token', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    const { rows } = await query(
      'DELETE FROM quests WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Quest not found', 404, 'NOT_FOUND');
    }

    return successResponse(res, { id: rows[0].id }, 200, 'Quest deleted successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/quests/:id/complete
 * Atomically marks quest complete, updates player XP, Gold, Realm XP,
 * evaluates Realm Level progression and mastery expansion side quests.
 */
export const completeQuest = async (req, res, next) => {
  const userId = getAuthUserId(req);
  if (!userId) {
    return errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
  }

  const { id } = req.params;
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Mark quest completed atomically
    const updateQuestRes = await client.query(
      `UPDATE quests
       SET completed = TRUE, completed_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2 AND completed = FALSE
       RETURNING *`,
      [id, userId]
    );

    if (updateQuestRes.rows.length === 0) {
      const checkRes = await client.query(
        'SELECT completed FROM quests WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      await client.query('ROLLBACK');
      if (checkRes.rows.length === 0) {
        return errorResponse(res, 'Quest not found', 404, 'NOT_FOUND');
      }
      return errorResponse(res, 'Quest has already been completed', 400, 'QUEST_ALREADY_COMPLETED');
    }

    const completedQuest = updateQuestRes.rows[0];

    // 2. Lock player record for update
    const playerRes = await client.query(
      `SELECT * FROM players WHERE user_id = $1 FOR UPDATE`,
      [userId]
    );

    if (playerRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return errorResponse(res, 'Player profile not found', 404, 'PLAYER_NOT_FOUND');
    }

    const player = playerRes.rows[0];

    // 3. Compute new XP, Gold, and Streak
    const xpReward = completedQuest.xp_reward || 50;
    const goldReward = completedQuest.gold_reward || 25;
    const newXp = (player.xp || 0) + xpReward;
    const newGold = (player.gold || 0) + goldReward;
    const levelInfo = calculateLevelFromXp(newXp);
    const newLevel = typeof levelInfo === 'object' && levelInfo !== null ? levelInfo.level : Number(levelInfo);
    const leveledUp = newLevel > player.level;

    // Calculate streak
    const priorQuestSql = `
      SELECT completed_at
      FROM quests
      WHERE user_id = $1 AND completed = TRUE AND id != $2 AND completed_at IS NOT NULL
      ORDER BY completed_at DESC
      LIMIT 1
    `;
    const priorRows = await client.query(priorQuestSql, [userId, id]);
    const lastDate = priorRows.rows.length > 0 ? priorRows.rows[0].completed_at : null;
    const streakInfo = calculateStreak(player.streak, lastDate, new Date());
    const newStreak = typeof streakInfo === 'object' && streakInfo !== null ? streakInfo.streak : Number(streakInfo);

    // 4. Update Realm XP and Realm Levels
    const realmTarget = completedQuest.realm_target || CATEGORY_TO_REALM[completedQuest.category] || 'mind';
    let newMindXp = player.mind_xp || 0;
    let newBodyXp = player.body_xp || 0;
    let newCraftXp = player.craft_xp || 0;

    if (realmTarget === 'mind') newMindXp += xpReward;
    else if (realmTarget === 'body') newBodyXp += xpReward;
    else if (realmTarget === 'craft') newCraftXp += xpReward;

    const newMindLevel = getRealmLevelFromXp(newMindXp);
    const newBodyLevel = getRealmLevelFromXp(newBodyXp);
    const newCraftLevel = getRealmLevelFromXp(newCraftXp);

    // 5. Handle Realm Mastery Expansion side quests
    let masteryExpansions = player.mastery_expansions || [];

    // If this quest was a mastery side quest, unlock the physical expansion!
    if (completedQuest.is_mastery_quest && completedQuest.expansion_reward) {
      if (!masteryExpansions.includes(completedQuest.expansion_reward)) {
        masteryExpansions = [...masteryExpansions, completedQuest.expansion_reward];
        await client.query(
          `INSERT INTO events (user_id, type, title, description)
           VALUES ($1, 'expansion_unlocked', $2, $3)`,
          [userId, 'World Expansion Unlocked!', `Mastery quest complete! Unlocked ${completedQuest.expansion_reward} in your 3D world.`]
        );
      }
    }

    // 6. Check if any realm reached Level 3 (Mastery) to spawn Mastery Side Quest
    const checkAndSpawnMasteryQuest = async (realm, title, desc, reward) => {
      const existing = await client.query(
        `SELECT id FROM quests WHERE user_id = $1 AND is_mastery_quest = TRUE AND realm_target = $2`,
        [userId, realm]
      );
      if (existing.rows.length === 0) {
        await client.query(
          `INSERT INTO quests (user_id, title, description, category, difficulty, xp_reward, gold_reward, is_mastery_quest, realm_target, expansion_reward)
           VALUES ($1, $2, $3, $4, 'epic', 150, 100, TRUE, $5, $6)`,
          [userId, title, desc, realm === 'mind' ? 'intelligence' : realm === 'body' ? 'strength' : 'creativity', realm, reward]
        );
        await client.query(
          `INSERT INTO events (user_id, type, title, description)
           VALUES ($1, 'realm_mastered', $2, $3)`,
          [userId, `${realm.toUpperCase()} Mastery Reached!`, `Unlocked mastery side quest: ${title}`]
        );
      }
    };

    if (newMindLevel >= 3) {
      await checkAndSpawnMasteryQuest('mind', 'Expand the Arcane Archive', 'Mastery achieved! Complete this mission to construct the Celestial Library Wing in your diorama.', 'mind_library');
    }
    if (newBodyLevel >= 3) {
      await checkAndSpawnMasteryQuest('body', 'Build the Grand Coliseum', 'Mastery achieved! Complete this mission to erect the Grand Gladiatorial Arena and victory banners.', 'body_coliseum');
    }
    if (newCraftLevel >= 3) {
      await checkAndSpawnMasteryQuest('craft', 'Expand the Engineering Foundry', 'Mastery achieved! Complete this mission to unlock advanced artisan trade workshops.', 'craft_foundry');
    }

    // 7. Update player record with all new stats
    await client.query(
      `UPDATE players
       SET
         xp = $1,
         gold = $2,
         level = $3,
         streak = $4,
         mind_xp = $5,
         body_xp = $6,
         craft_xp = $7,
         mind_level = $8,
         body_level = $9,
         craft_level = $10,
         mastery_expansions = $11,
         updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $12`,
      [
        newXp,
        newGold,
        newLevel,
        newStreak,
        newMindXp,
        newBodyXp,
        newCraftXp,
        newMindLevel,
        newBodyLevel,
        newCraftLevel,
        masteryExpansions,
        userId,
      ]
    );

    // 8. Log quest completed and level up events
    await client.query(
      `INSERT INTO events (user_id, type, title, description)
       VALUES ($1, 'quest_completed', $2, $3)`,
      [userId, `Quest Completed: ${completedQuest.title}`, `Earned +${xpReward} XP and +${goldReward} Gold.`]
    );

    if (leveledUp) {
      await client.query(
        `INSERT INTO events (user_id, type, title, description)
         VALUES ($1, 'level_up', $2, $3)`,
        [userId, `Level Up! Reached Level ${newLevel}`, `Congratulations! You leveled up from Level ${player.level} to Level ${newLevel}.`]
      );
    }

    await client.query('COMMIT');

    // 9. Evaluate achievements
    const newlyUnlockedAchievements = await evaluateAchievements(userId);

    return successResponse(res, {
      quest: completedQuest,
      rewardsAwarded: {
        xp: xpReward,
        gold: goldReward,
        realm: realmTarget,
      },
      player: {
        level: newLevel,
        xp: levelInfo?.currentLevelXp ?? (newXp - (levelInfo?.currentLevelBaseXp || 0)),
        nextLevelXp: levelInfo?.nextLevelThreshold ?? 100,
        totalXp: newXp,
        currentLevelBaseXp: levelInfo?.currentLevelBaseXp || 0,
        progressPercent: levelInfo?.progressPercent || 0,
        gold: newGold,
        streak: newStreak,
        leveledUp,
        mindXp: newMindXp,
        bodyXp: newBodyXp,
        craftXp: newCraftXp,
        mindLevel: newMindLevel,
        bodyLevel: newBodyLevel,
        craftLevel: newCraftLevel,
        masteryExpansions,
      },
      realmLevels: {
        mind: newMindLevel,
        body: newBodyLevel,
        craft: newCraftLevel,
      },
      realmXp: {
        mind: newMindXp,
        body: newBodyXp,
        craft: newCraftXp,
      },
      masteryExpansions,
      unlockedAchievements: newlyUnlockedAchievements,
    }, 200, 'Quest completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};
