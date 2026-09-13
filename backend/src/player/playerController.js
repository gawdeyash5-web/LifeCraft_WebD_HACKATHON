import { query } from '../database/db.js';
import { getXpForLevel, calculateLevelFromXp } from '../progression/progressionService.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Player Controller
 * Manages player profile, level, gold, realm XP, equipped cosmetics, and mastery expansions.
 */

export const getPlayerProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id;

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
         p.mind_xp,
         p.body_xp,
         p.craft_xp,
         p.mind_level,
         p.body_level,
         p.craft_level,
         p.equipped_skin,
         p.equipped_pet,
         p.equipped_decor,
         p.mastery_expansions,
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
    const progression = calculateLevelFromXp(player.xp);

    return successResponse(res, {
      id: player.id,
      userId: player.user_id,
      username: player.username,
      level: progression.level,
      xp: progression.currentLevelXp,
      nextLevelXp: progression.nextLevelThreshold,
      totalXp: progression.totalXp,
      currentLevelBaseXp: progression.currentLevelBaseXp,
      progressPercent: progression.progressPercent,
      gold: player.gold,
      streak: player.streak,
      attributes: {
        intelligence: player.intelligence,
        strength: player.strength,
        creativity: player.creativity,
        wisdom: player.wisdom,
        discipline: player.discipline,
      },
      realmXp: {
        mind: player.mind_xp || 0,
        body: player.body_xp || 0,
        craft: player.craft_xp || 0,
      },
      realmLevels: {
        mind: player.mind_level || 1,
        body: player.body_level || 1,
        craft: player.craft_level || 1,
      },
      equipped: {
        skin: player.equipped_skin || 'character-archer',
        pet: player.equipped_pet || null,
        decor: player.equipped_decor || null,
      },
      masteryExpansions: player.mastery_expansions || [],
      unlockedRegions: player.unlocked_regions || ['mind', 'body', 'craft'],
      activeRegion: player.active_region || 'mind',
    });
  } catch (err) {
    next(err);
  }
};

export const updatePlayerRegion = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id;
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
