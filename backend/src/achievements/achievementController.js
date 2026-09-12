import { getUserAchievements, evaluateAchievements } from './achievementService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const listAchievements = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }

    // Evaluate in case conditions were satisfied
    await evaluateAchievements(userId);

    const achievements = await getUserAchievements(userId);
    return successResponse(res, achievements, 200);
  } catch (err) {
    next(err);
  }
};
