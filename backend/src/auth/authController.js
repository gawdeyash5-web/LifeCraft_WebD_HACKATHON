import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Authentication Controller (Owned by Member 3)
 * Handles registration, login, and token generation.
 */

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return errorResponse(res, 'Username, email, and password are required', 400, 'VALIDATION_ERROR');
    }

    // TODO (Member 3):
    // 1. Hash password with bcryptjs
    // 2. Insert into `users` table via db.js query()
    // 3. Create initial player row in `players` table
    // 4. Sign and return JWT token

    return successResponse(res, {
      message: 'Registration endpoint ready. Member 3: implement DB insert & password hash.',
      mockUser: { username, email }
    }, 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400, 'VALIDATION_ERROR');
    }

    // TODO (Member 3):
    // 1. Query user by email from `users`
    // 2. Compare password with bcryptjs
    // 3. Return signed JWT token and user info

    return successResponse(res, {
      message: 'Login endpoint ready. Member 3: implement DB lookup & password compare.',
      mockUser: { email }
    }, 200);
  } catch (err) {
    next(err);
  }
};
