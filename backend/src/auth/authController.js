import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool, query } from '../database/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Authentication Controller (Owned by Member 3)
 * Handles user registration, login, and JWT token issuance.
 */

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return errorResponse(res, 'Username, email, and password are required', 400, 'VALIDATION_ERROR');
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.toLowerCase().trim();

    if (trimmedUsername.length < 3) {
      return errorResponse(res, 'Username must be at least 3 characters long', 400, 'VALIDATION_ERROR');
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters long', 400, 'VALIDATION_ERROR');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if user with this email or username already exists
      const existing = await client.query(
        'SELECT id, email, username FROM users WHERE email = $1 OR username = $2',
        [trimmedEmail, trimmedUsername]
      );

      if (existing.rows.length > 0) {
        await client.query('ROLLBACK');
        const conflictField = existing.rows[0].email === trimmedEmail ? 'Email' : 'Username';
        return errorResponse(res, `${conflictField} is already registered`, 409, 'USER_EXISTS');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 1. Insert into users table
      const userResult = await client.query(
        `INSERT INTO users (username, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, username, email, created_at`,
        [trimmedUsername, trimmedEmail, passwordHash]
      );
      const newUser = userResult.rows[0];

      // 2. Create initial player row in players table (1:1 relation)
      await client.query(
        `INSERT INTO players (
           user_id, level, xp, gold, streak,
           intelligence, strength, creativity, wisdom, discipline,
           unlocked_regions, active_region
         ) VALUES (
           $1, 1, 0, 50, 0,
           10, 10, 10, 10, 10,
           ARRAY['mind', 'body', 'craft'], 'mind'
         )`,
        [newUser.id]
      );

      await client.query('COMMIT');

      // 3. Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'hackathon_default_secret';
      const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
      const token = jwt.sign(
        { userId: newUser.id, username: newUser.username, email: newUser.email },
        jwtSecret,
        { expiresIn }
      );

      return successResponse(res, {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        },
        token,
      }, 201, 'User registered successfully');
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }
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

    const trimmedEmail = email.toLowerCase().trim();

    // 1. Look up user by email
    const userResult = await query(
      'SELECT id, username, email, password_hash FROM users WHERE email = $1',
      [trimmedEmail]
    );

    if (userResult.rows.length === 0) {
      return errorResponse(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const user = userResult.rows[0];

    // 2. Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // 3. Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'hackathon_default_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      jwtSecret,
      { expiresIn }
    );

    return successResponse(res, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    }, 200, 'Login successful');
  } catch (err) {
    next(err);
  }
};
