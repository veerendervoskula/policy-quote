import { ZodError } from 'zod/v3/external.cjs';
import { QuoteRequestSchema, QuoteRequest } from '../dto/QuoteRequest';
import { ValidationError } from '../types/errors';

/**
 * ValidationService - Handles all request validation logic.
 * 
 * Responsibilities:
 * - Validate postcode format (simple  format)
 * - Parse and validate incoming quote request against Zod schema
 * - Return typed QuoteRequest or throw ValidationError
 */
export class ValidationService {
  /**
   * Validates and parses raw quote request data.
   * 
   * @param rawData - Untyped input data from request body
   * @returns Validated QuoteRequest object
   * @throws ValidationError if validation fails
   */
  public static validateRequest(rawData: unknown): QuoteRequest {
    try {
      const validated = QuoteRequestSchema.parse(rawData);
      return validated;
    } catch (error) {
      // Extract field-level errors from Zod validation
      const details: Record<string, string> = {};
      if (error instanceof Error && 'errors' in error) {
        const zodErrors = (error as ZodError).errors;
        for (const err of zodErrors) {
          const path = err.path.join('.');
          details[path] = err.message;
        }
      }
      throw new ValidationError('Invalid quote request', details);
    }
  }
}
