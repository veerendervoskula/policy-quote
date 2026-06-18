import { z } from 'zod';

/**
 * QuoteRequest Zod schema for home insurance quote requests.
 * 
 * Fields:
 * - name: Customer full name (1-100 chars)
 * - age: Customer age (18-100)
 * - propertyType: Type of dwelling (House, Flat, Bungalow)
 * - dwellingValue: Total property value in £ (50,000 - 2,000,000)
 * - postcode: UK postcode (format: alphanumeric, space allowed)
 * - priorClaims: Number of claims in past 5 years (0-5+)
 */
export const QuoteRequestSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  age: z.number()
    .int('Age must be an integer')
    .min(18, 'Must be at least 18 years old')
    .max(100, 'Age must be 100 or less'),
  propertyType: z.enum(['House', 'Flat', 'Bungalow'], {
    errorMap: () => ({ message: 'Property type must be House, Flat, or Bungalow' })
  }),
  dwellingValue: z.number()
    .positive('Dwelling value must be positive')
    .min(50000, 'Dwelling value must be at least £50,000')
    .max(2000000, 'Dwelling value cannot exceed £2,000,000'),
  postcode: z.string()
    .trim()
    .min(6, 'Postcode must be at least 6 characters')
    .max(8, 'Postcode must not exceed 8 characters')
    .transform(val => val.toUpperCase()),
  priorClaims: z.number()
    .int('Prior claims must be an integer')
    .min(0, 'Prior claims cannot be negative')
    .max(10, 'Prior claims value too high')
});

export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;
