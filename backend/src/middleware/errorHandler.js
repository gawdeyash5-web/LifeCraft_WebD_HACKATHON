import { errorResponse } from '../utils/response.js';

/**
 * Global Express Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'SERVER_ERROR';

  return errorResponse(res, message, statusCode, code);
};
