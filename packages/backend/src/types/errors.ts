/**
 * Custom error types for structured error handling.
 * All errors return responses in the format: { code, message, details }
 */

export class ValidationError extends Error {
  public readonly code = 'VALIDATION_ERROR';
  public readonly statusCode = 400;
  public readonly details: Record<string, string> = {};

  constructor(message: string, details?: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
    if (details) {
      this.details = details;
    }
  }
}

export class BusinessLogicError extends Error {
  public readonly code = 'BUSINESS_LOGIC_ERROR';
  public readonly statusCode = 422;
  public readonly details: Record<string, unknown> = {};

  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'BusinessLogicError';
    if (details) {
      this.details = details;
    }
  }
}

export class UnauthorizedError extends Error {
  public readonly code = 'UNAUTHORIZED';
  public readonly statusCode = 401;

  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Structured error response format.
 * Used by centralized error handler middleware.
 */
export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp?: string;
}

/**
 * Type guard to check if an object is a known application error.
 */
export function isApplicationError(error: unknown): error is ValidationError | BusinessLogicError | UnauthorizedError {
  return (
    error instanceof ValidationError ||
    error instanceof BusinessLogicError ||
    error instanceof UnauthorizedError
  );
}
