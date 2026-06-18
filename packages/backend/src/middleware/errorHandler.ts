import { Request, Response, NextFunction } from 'express';
import { isApplicationError, ErrorResponse } from '../types/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Centralized error handler middleware.
 * 
 * Responsibilities:
 * - Catches all error types (ValidationError, BusinessLogicError, UnknownError)
 * - Returns structured error response: { code, message, details, timestamp }
 * - Logs errors with appropriate severity
 * - Sets appropriate HTTP status codes
 * 
 * @param err - Error object
 * @param _req - Express request (unused but required for error middleware)
 * @param res - Express response
 * @param _next - Express next function (unused but required for error middleware)
 */
export function errorHandler(
  err: Error | any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const errorResponse: ErrorResponse = {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  };

  let statusCode = 500;

  if (isApplicationError(err)) {
    errorResponse.code = err.code;
    errorResponse.message = err.message;
    if ('details' in err && err.details) {
      errorResponse.details = err.details;
    }
    statusCode = err.statusCode;

    if (statusCode >= 400 && statusCode < 500) {
      logger.warn(`Client error: ${errorResponse.code}`, {
        message: errorResponse.message,
        details: errorResponse.details
      });
    } else {
      logger.error(`Server error: ${errorResponse.code}`, {
        message: errorResponse.message,
        details: errorResponse.details
      });
    }
  } else if (err instanceof SyntaxError) {
    // JSON parse errors
    errorResponse.code = 'INVALID_JSON';
    errorResponse.message = 'Invalid JSON in request body';
    statusCode = 400;
    logger.warn('JSON parse error');
  } else {
    errorResponse.message = err?.message ?? 'Unknown error';
    logger.error('Unexpected error', { error: err });
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * Async route wrapper to catch Promise rejections.
 * Wrap async route handlers to ensure errors are caught and passed to errorHandler.
 * 
 * @param fn - Async route handler
 * @returns Wrapped handler that catches errors
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
