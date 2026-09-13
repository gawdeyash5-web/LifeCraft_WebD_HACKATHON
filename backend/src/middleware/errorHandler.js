import { errorResponse } from '../utils/response.js';

/**
 * Global Express Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'SERVER_ERROR';

  // Production security: never leak internal SQL, filesystem paths, or stack traces
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    message = 'An unexpected server error occurred. Please try again later.';
    code = 'INTERNAL_SERVER_ERROR';
  }

  return errorResponse(res, message, statusCode, code);
};
