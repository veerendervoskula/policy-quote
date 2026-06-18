import { Router, Request, Response } from 'express';
import { ValidationService } from '../services/ValidationService.js';
import { RiskScoringService } from '../services/RiskScoringService.js';
import { PremiumCalculationService } from '../services/PremiumCalculationService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const quoteRoutes = Router();

/**
 * POST /api/policy/quote
 * 
 * Handles home insurance policy quote requests.
 * 
 * Request body schema (validated with Zod):
 * {
 *   name: string (1-100 chars)
 *   age: number (18-100)
 *   propertyType: 'House' | 'Flat' | 'Bungalow'
 *   dwellingValue: number (£50k - £2M)
 *   postcode: string (UK format)
 *   priorClaims: number (0-10)
 * }
 * 
 * Response: QuoteResponse
 * {
 *   monthlyPremium: number
 *   annualPremium: number
 *   riskScore: number
 *   riskBand: 'STANDARD' | 'ELEVATED' | 'HIGH_RISK'
 *   riskSummary: string
 *   coverageDetails: {...}
 * }
 * 
 * Error responses:
 * - 400: ValidationError (invalid input)
 * - 422: BusinessLogicError (business rule violation)
 * - 500: Unexpected error
 */
quoteRoutes.post(
  '/policy/quote',
  asyncHandler(async (req: Request, res: Response) => {
    // Step 1: Validate request
    const validatedRequest = ValidationService.validateRequest(req.body);

    // Step 2: Assess risk
    const riskAssessment = RiskScoringService.assessRisk(validatedRequest);

    // Step 3: Calculate premium and generate response
    const quoteResponse = PremiumCalculationService.generateQuoteResponse(
      validatedRequest,
      riskAssessment
    );

    // Step 4: Return response
    res.status(200).json(quoteResponse);
  })
);
