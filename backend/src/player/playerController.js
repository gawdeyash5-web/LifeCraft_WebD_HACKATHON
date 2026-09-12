import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Player Controller (Owned by Member 3)
 * Manages player profile, level, gold, and attributes.
 */

export const getPlayerProfile = async (req, res, next) => {
  try {
    // TODO (Member 3):
    // 1. Extract user id from req.user (populated by requireAuth middleware)
    // 2. Query player attributes & stats from `players` table
    // 3. Return player state contract

    return successResponse(res, {
      message: 'Player profile endpoint ready. Member 3: wire up with DB query.',
      contractSample: {
        level: 1,
        xp: 0,
        nextLevelXp: 100,
        gold: 50,
        streak: 0,
        attributes: {
          intelligence: 10,
          strength: 10,
          creativity: 10,
          wisdom: 10,
          discipline: 10
        },
        unlockedRegions: ['mind', 'body', 'craft']
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updatePlayerRegion = async (req, res, next) => {
  try {
    const { activeRegion } = req.body;
    // TODO (Member 3): Update active_region in `players`
    return successResponse(res, { activeRegion });
  } catch (err) {
    next(err);
  }
};
