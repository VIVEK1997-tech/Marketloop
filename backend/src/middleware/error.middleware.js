import { sendError } from '../utils/apiResponse.js';

export const notFound = (req, res, next) => {
  const error = new Error(`Not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  return sendError(res, err.message || 'Server error', {
    statusCode,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};
