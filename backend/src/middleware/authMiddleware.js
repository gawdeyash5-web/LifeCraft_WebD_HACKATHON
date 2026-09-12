import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response.js';

/**
 * Authentication Middleware (Owned by Member 3)
 * 
 * Verifies Bearer JWT token and attaches user payload to req.user
 * TODO (Member 3): Implement token verification & database lookup
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authentication token missing or invalid format', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'hackathon_default_secret';
    const decoded = jwt.verify(token, secret);
    req.user = {
      ...decoded,
      userId: decoded.userId || decoded.id,
    };
    next();
  } catch (err) {
    return errorResponse(res, 'Invalid or expired authentication token', 401, 'INVALID_TOKEN');
  }
};
