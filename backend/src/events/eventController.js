import { query } from '../database/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const listEvents = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }

    const result = await query(
      `SELECT id, type, title, description, created_at as "createdAt"
       FROM events
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 30`,
      [userId]
    );

    return successResponse(res, result.rows, 200);
  } catch (err) {
    next(err);
  }
};
