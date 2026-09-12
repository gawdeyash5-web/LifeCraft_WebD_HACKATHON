import { successResponse, errorResponse } from '../utils/response.js';
import { calculateLevelFromXp, calculateRewardsForQuest } from '../progression/progressionService.js';

/**
 * Quest Controller (Owned by Member 2)
 * Handles Quest CRUD, listing, filtering, and completion rewards.
 */

export const listQuests = async (req, res, next) => {
  try {
    // TODO (Member 2):
    // 1. Fetch user quests from `quests` table
    // 2. Filter by category or completion status if query param provided
    return successResponse(res, {
      message: 'Quest listing endpoint ready. Member 2: query DB for quests.',
      quests: []
    });
  } catch (err) {
    next(err);
  }
};

export const createQuest = async (req, res, next) => {
  try {
    const { title, description, category, difficulty } = req.body;

    if (!title || !category) {
      return errorResponse(res, 'Title and category are required', 400, 'VALIDATION_ERROR');
    }

    // TODO (Member 2):
    // 1. Calculate rewards based on difficulty using progressionService
    // 2. Insert into `quests` table
    const rewards = calculateRewardsForQuest(difficulty || 'medium', category);

    return successResponse(res, {
      message: 'Quest creation endpoint ready. Member 2: insert into quests table.',
      questDraft: {
        title,
        description,
        category,
        difficulty: difficulty || 'medium',
        ...rewards
      }
    }, 201);
  } catch (err) {
    next(err);
  }
};

export const completeQuest = async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO (Member 2):
    // 1. Mark quest completed in DB
    // 2. Award XP, Gold, Attribute progress to Player in DB
    // 3. Check for level up using progressionService

    return successResponse(res, {
      message: `Quest ${id} completion endpoint ready. Member 2: update quest and player state in DB.`,
      questId: id,
      completed: true
    });
  } catch (err) {
    next(err);
  }
};

export const deleteQuest = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO (Member 2): Delete quest from DB
    return successResponse(res, { message: `Quest ${id} deleted successfully.` });
  } catch (err) {
    next(err);
  }
};
