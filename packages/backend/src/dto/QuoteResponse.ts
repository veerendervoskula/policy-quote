/**
 * QuoteResponse DTO - the API response contract for a policy quote.
 * 
 * Fields:
 * - monthlyPremium: Calculated monthly premium in £
 * - annualPremium: Calculated annual premium in £
 * - riskScore: Computed risk score (0-100)
 * - riskBand: Risk category label (STANDARD, ELEVATED, HIGH_RISK)
 * - riskSummary: Human-readable risk assessment
 * - coverageDetails: Coverage information and applied factors
 */
export interface QuoteResponse {
  monthlyPremium: number;
  annualPremium: number;
  riskScore: number;
  riskBand: 'STANDARD' | 'ELEVATED' | 'HIGH_RISK';
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
