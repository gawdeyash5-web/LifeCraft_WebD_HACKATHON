import { query } from '../database/db.js';
import { getXpForLevel } from '../progression/progressionService.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Player Controller (Owned by Member 3)
 * Manages player profile, level, gold, and attributes.
 */

export const getPlayerProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT
         p.id,
         p.user_id,
         p.level,
         p.xp,
         p.gold,
         p.streak,
         p.intelligence,
         p.strength,
         p.creativity,
         p.wisdom,
         p.discipline,
         p.unlocked_regions,
         p.active_region,
         u.username
       FROM players p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Player profile not found', 404, 'PLAYER_NOT_FOUND');
    }

    const player = result.rows[0];
    const nextLevelXp = getXpForLevel(player.level + 1);

    return successResponse(res, {
      id: player.id,
      userId: player.user_id,
      username: player.username,
      level: player.level,
      xp: player.xp,
      nextLevelXp,
      gold: player.gold,
      streak: player.streak,
      attributes: {
        intelligence: player.intelligence,
        strength: player.strength,
        creativity: player.creativity,
        wisdom: player.wisdom,
        discipline: player.discipline,
      },
      unlockedRegions: player.unlocked_regions || ['mind', 'body', 'craft'],
      activeRegion: player.active_region || 'mind',
    });
  } catch (err) {
    next(err);
  }
};

export const updatePlayerRegion = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { activeRegion } = req.body;

    if (!activeRegion) {
      return errorResponse(res, 'activeRegion is required', 400, 'VALIDATION_ERROR');
    }

    const validRegions = ['mind', 'body', 'craft'];
    if (!validRegions.includes(activeRegion)) {
      return errorResponse(res, `Invalid region. Must be one of: ${validRegions.join(', ')}`, 400, 'INVALID_REGION');
    }

    const result = await query(
      `UPDATE players
       SET active_region = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING active_region`,
      [activeRegion, userId]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Player profile not found', 404, 'PLAYER_NOT_FOUND');
    }

    return successResponse(res, { activeRegion: result.rows[0].active_region });
  } catch (err) {
    next(err);
  }
};
