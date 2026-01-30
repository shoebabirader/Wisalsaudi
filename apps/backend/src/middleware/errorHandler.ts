/**
 * Error Handler Middleware
 * Centralized error handling for the API
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error
  console.error('Error:', err);

  // Handle AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      messageAr: 'حدث خطأ غير متوقع',
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
