import { successResponse, errorResponse } from '../utils/response.js';
import {
  calculateRewardsForQuest,
  calculateQuestCompletionProgression,
  VALID_CATEGORIES,
  VALID_DIFFICULTIES,
} from '../progression/progressionService.js';
import { query } from '../database/db.js';

/**
 * Quest Controller (Owned by Member 2)
 * Handles Quest CRUD, filtering, duplicate completion protection, and progression calculation.
 * 
 * Boundaries:
 * - Scoped strictly to authenticated user's ID (req.user). Never trusts req.body.user_id.
 * - Queries and updates ONLY the `quests` table.
 * - Does NOT read, update, or persist to the `players` table.
 * - Progression and rewards are calculated via pure functions in progressionService.js.
 */

// Helper to reliably extract authenticated user ID
const getAuthUserId = (req) => {
  return req.user?.id || req.user?.userId || req.user?.sub;
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
    if (category) {
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

    sql += ' ORDER BY created_at DESC';

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

    const insertSql = `
      INSERT INTO quests (user_id, title, description, category, difficulty, xp_reward, gold_reward)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
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
    ]);

    return successResponse(res, rows[0], 201, 'Quest created successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/quests/:id
 * Update an existing quest owned by the authenticated user.
 */
export const updateQuest = async (req, res, next) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return errorResponse(res, 'User ID not found in authentication token', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;

    // Check quest ownership
    const { rows: existingRows } = await query(
      'SELECT * FROM quests WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingRows.length === 0) {
      return errorResponse(res, 'Quest not found', 404, 'NOT_FOUND');
    }

    const currentQuest = existingRows[0];

    // Completed quests cannot have difficulty or category changed
    if (currentQuest.completed) {
      return errorResponse(res, 'Cannot modify an already completed quest', 400, 'QUEST_ALREADY_COMPLETED');
    }

    const { title, description, category, difficulty } = req.body;

    const updatedTitle = title !== undefined ? String(title).trim() : currentQuest.title;
    if (!updatedTitle) {
      return errorResponse(res, 'Title cannot be empty', 400, 'VALIDATION_ERROR');
    }
    if (updatedTitle.length > 150) {
      return errorResponse(res, 'Title must not exceed 150 characters', 400, 'VALIDATION_ERROR');
    }

    const updatedDescription = description !== undefined
      ? (description ? String(description).trim() : null)
      : currentQuest.description;

    const targetCategory = category !== undefined ? String(category).toLowerCase().trim() : currentQuest.category;
    const targetDifficulty = difficulty !== undefined ? String(difficulty).toLowerCase().trim() : currentQuest.difficulty;

    // Recalculate rewards if category or difficulty is being changed
    const rewards = calculateRewardsForQuest(targetDifficulty, targetCategory);
    const resolvedCategory = rewards.attributeReward.attribute;
    const resolvedDifficulty = VALID_DIFFICULTIES.includes(targetDifficulty) ? targetDifficulty : currentQuest.difficulty;

    const updateSql = `
      UPDATE quests
      SET title = $1, description = $2, category = $3, difficulty = $4, xp_reward = $5, gold_reward = $6
      WHERE id = $7 AND user_id = $8
      RETURNING *
    `;

    const { rows: updatedRows } = await query(updateSql, [
      updatedTitle,
      updatedDescription,
      resolvedCategory,
      resolvedDifficulty,
      rewards.xpReward,
      rewards.goldReward,
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
 * Mark quest completed and calculate resulting progression.
 * 
 * Rules:
 * 1. Atomically marks quest completed and sets completed_at in quests table.
 * 2. Prevents duplicate completion / rewards.
 * 3. Uses stored quest rewards and progressionService pure functions.
 * 4. Does NOT read or update the players table.
 * 5. Returns calculated progression to the caller for Member 3 to integrate.
 */
export const completeQuest = async (req, res, next) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return errorResponse(res, 'User ID not found in authentication token', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;

    // Atomic update: only succeeds if quest is not already completed
    const updateSql = `
      UPDATE quests
      SET completed = TRUE, completed_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2 AND completed = FALSE
      RETURNING *
    `;
    const { rows } = await query(updateSql, [id, userId]);

    if (rows.length === 0) {
      // Check if quest exists to provide exact 404 vs duplicate completion error
      const { rows: existingRows } = await query(
        'SELECT * FROM quests WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (existingRows.length === 0) {
        return errorResponse(res, 'Quest not found', 404, 'NOT_FOUND');
      }

      // Quest exists and is already completed: prevent duplicate rewards
      return errorResponse(res, 'Quest has already been completed', 400, 'QUEST_ALREADY_COMPLETED');
    }

    const completedQuest = rows[0];

    // Streak reference lookup: Find the most recent prior quest completed before this one
    const priorQuestSql = `
      SELECT completed_at
      FROM quests
      WHERE user_id = $1 AND completed = TRUE AND id != $2 AND completed_at IS NOT NULL
      ORDER BY completed_at DESC
      LIMIT 1
    `;
    const { rows: priorRows } = await query(priorQuestSql, [userId, id]);
    const lastCompletionDate = priorRows.length > 0 ? priorRows[0].completed_at : null;

    // Pure progression calculation: takes quest and optional playerState input, returns progression output
    const playerStateInput = req.body?.playerState || {};
    const progression = calculateQuestCompletionProgression({
      quest: completedQuest,
      playerState: playerStateInput,
      lastCompletionDate,
      currentDate: completedQuest.completed_at || new Date(),
    });

    return successResponse(res, {
      quest: completedQuest,
      rewardsAwarded: {
        xp: completedQuest.xp_reward,
        gold: completedQuest.gold_reward,
        attribute: progression.attributePointsAwarded.attribute,
        amount: progression.attributePointsAwarded.amount,
      },
      player: {
        level: progression.level,
        xp: progression.totalXp,
        streak: progression.streak,
        leveledUp: progression.leveledUp,
      },
      progression,
    }, 200, 'Quest completed successfully');
  } catch (err) {
    next(err);
  }
};

