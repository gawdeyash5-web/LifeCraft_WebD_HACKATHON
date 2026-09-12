/**
 * Standardized API Response Helpers
 */

export const successResponse = (res, data = null, statusCode = 200, message = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    error: null,
  });
};

export const errorResponse = (res, message = 'An error occurred', statusCode = 500, code = 'INTERNAL_ERROR') => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
    },
  });
};
