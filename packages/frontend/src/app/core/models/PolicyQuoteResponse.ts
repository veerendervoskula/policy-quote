import { RiskBand } from "../utils/constants";

/**
 * QuoteResponse interface - Mirrors backend DTO.
 * Typed response from policy quote API.
 */
export interface PolicyQuoteResponse {
  monthlyPremium: number;
  annualPremium: number;
  riskScore: number;
  riskBand: RiskBand;
  riskSummary: string;
  coverageDetails: {
    baseAnnualRate: number;
    riskMultiplier: number;
    appliedFactors: {
      agePoints: number;
      claimsPoints: number;
      propertyPoints: number;
      totalPoints: number;
    };
    discounts: {
      description: string;
      percentage: number;
    }[];
  };
}

/**
 * ApiError response from backend.
 */
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
