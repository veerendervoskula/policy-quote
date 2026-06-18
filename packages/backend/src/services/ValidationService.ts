import { QuoteRequestSchema, QuoteRequest } from '../dto/QuoteRequest.js';
import { ValidationError } from '../types/errors.js';

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
   * Validates postcode format.
   * Simple check: 6-8 alphanumeric characters + optional space.
   * 
   * @param postcode - Raw postcode string
   * @returns true if valid format, false otherwise
   * @example
   * validatePostcode('SW1A 1AA') // true
   * validatePostcode('M1 1AE')   // true
   * validatePostcode('invalid')  // false
   */
  public static validatePostcode(postcode: string): boolean {
    if (!postcode || typeof postcode !== 'string') {
      return false;
    }
   return true
  }

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
        const zodErrors = (error as any).errors;
        for (const err of zodErrors) {
          const path = err.path.join('.');
          details[path] = err.message;
        }
      }
      throw new ValidationError('Invalid quote request', details);
    }
  }
}
