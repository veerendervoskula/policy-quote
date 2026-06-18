import { QuoteResponse } from '../dto/QuoteResponse.js';
import { RiskScoringService } from './RiskScoringService.js';
import { QuoteRequest } from '../dto/QuoteRequest.js';

/**
 * PremiumCalculationService - Determines insurance premiums based on risk and property value.
 * 
 * Premium Formula:
 * annualPremium = basePremium × riskMultiplier × coverageLoadFactor
 * 
 * Where:
 * - basePremium = dwelling value × baseRate (e.g., 0.3% for £300k property)
 * - riskMultiplier = factor derived from risk band (STANDARD 0.95, ELEVATED 1.25, HIGH_RISK 1.55)
 * - coverageLoadFactor = 1.0 (standard full coverage; could vary for partial coverage scenarios)
 * 
 * Assumptions:
 * - Base rate is proportional to property value (higher value = higher premium need)
 * - Risk multipliers reflect underwriting guidelines
 * - All calculations rounded to nearest £
 */
export class PremiumCalculationService {
  // Base annual rate as percentage of dwelling value
  private static readonly BASE_RATE = 0.003; // 0.3%

  // Risk multipliers by band (applied to base premium)
  private static readonly RISK_MULTIPLIERS: Record<string, number> = {
    STANDARD: 0.95,      // Preferred risk: 5% discount
    ELEVATED: 1.25,      // Moderate loading: 25% above base
    HIGH_RISK: 1.55      // Significant loading: 55% above base
  };

  // Coverage load factor (future-proof for multi-coverage scenarios)
  private static readonly COVERAGE_LOAD_FACTOR = 1.0;

  /**
   * Calculates annual premium based on property value and risk band.
   * 
   * @param dwellingValue - Property value in £
   * @param riskBand - Risk classification (STANDARD, ELEVATED, HIGH_RISK)
   * @returns Object with annualPremium and monthlyPremium
   */
  public static calculatePremium(
    dwellingValue: number,
    riskBand: 'STANDARD' | 'ELEVATED' | 'HIGH_RISK'
  ): { annualPremium: number; monthlyPremium: number; baseAnnualRate: number; riskMultiplier: number } {
    // Calculate base premium (property value × base rate)
    const baseAnnualRate = dwellingValue * this.BASE_RATE;

    // Apply risk multiplier
    const riskMultiplier = this.RISK_MULTIPLIERS[riskBand] ?? this.RISK_MULTIPLIERS.STANDARD;
    const loadedPremium = baseAnnualRate * riskMultiplier * this.COVERAGE_LOAD_FACTOR;

    // Round to nearest £
    const annualPremium = Math.round(loadedPremium);
    const monthlyPremium = Math.round(annualPremium / 12);

    return {
      annualPremium,
      monthlyPremium,
      baseAnnualRate,
      riskMultiplier
    };
  }

  /**
   * Generates a human-readable risk summary based on risk band and factors.
   * 
   * @param riskBand - Risk classification
   * @param factors - Risk factor breakdown
   * @param request - Original quote request
   * @returns Plain-text risk summary
   */
  public static generateRiskSummary(
    riskBand: 'STANDARD' | 'ELEVATED' | 'HIGH_RISK',
    factors: { ageScore: number; claimsScore: number; propertyScore: number },
    request: QuoteRequest
  ): string {
    const lines: string[] = [];

    // Base summary by band
    if (riskBand === 'STANDARD') {
      lines.push(`Your profile qualifies for our Standard risk category.`);
    } else if (riskBand === 'ELEVATED') {
      lines.push(`Your profile is classified as Elevated risk.`);
    } else {
      lines.push(`Your profile is classified as High Risk and requires special underwriting.`);
    }

    // Factor-specific insights
    const insights: string[] = [];

    if (factors.ageScore > 0) {
      insights.push(
        request.age < 25
          ? 'Your age group typically has higher accident rates.'
          : 'Your age may indicate different risk exposure.'
      );
    }

    if (factors.claimsScore > 0) {
      insights.push(
        `Your prior claim history (${request.priorClaims} claim${request.priorClaims !== 1 ? 's' : ''}) adds risk.`
      );
    }

    if (factors.propertyScore > 0) {
      if (request.propertyType === 'Flat') {
        insights.push('Flat properties have shared-risk exposure.');
      }
      if (request.dwellingValue > 750000) {
        insights.push('Your high-value property requires enhanced coverage consideration.');
      }
    }

    if (insights.length > 0) {
      lines.push('Factors affecting your quote:');
      insights.forEach(insight => lines.push(`• ${insight}`));
    } else {
      lines.push('Your property and profile present acceptable risk.');
    }

    return lines.join(' ');
  }

  /**
   * Compiles complete quote response with premium, risk assessment, and coverage details.
   * 
   * @param request - Validated quote request
   * @param riskAssessment - Risk scoring results
   * @returns Complete QuoteResponse object
   */
  public static generateQuoteResponse(
    request: QuoteRequest,
    riskAssessment: Awaited<ReturnType<typeof RiskScoringService.assessRisk>>
  ): QuoteResponse {
    let { annualPremium, monthlyPremium, baseAnnualRate, riskMultiplier } = this.calculatePremium(
      request.dwellingValue,
      riskAssessment.riskBand
    );

    const riskSummary = this.generateRiskSummary(
      riskAssessment.riskBand,
      {
        ageScore: riskAssessment.ageScore,
        claimsScore: riskAssessment.claimsScore,
        propertyScore: riskAssessment.propertyScore
      },
      request
    );

    const discounts: Array<{ description: string; percentage: number }> = [];
    // Placeholder for future discount features (e.g., bundling, loyalty)
    if (riskAssessment.claimsScore === 0 && riskAssessment.ageScore === 0) {
      const discountPercent = 3;
      discounts.push({ description: 'Clean history discount', percentage: discountPercent });
      
      // Apply discount to premiums
      annualPremium = Math.round(annualPremium * (1 - discountPercent / 100));
      monthlyPremium = Math.round(annualPremium / 12);
    }

    return {
      monthlyPremium,
      annualPremium,
      riskScore: riskAssessment.totalScore,
      riskBand: riskAssessment.riskBand,
      riskSummary,
      coverageDetails: {
        baseAnnualRate: Math.round(baseAnnualRate),
        riskMultiplier,
        appliedFactors: {
          agePoints: riskAssessment.ageScore,
          claimsPoints: riskAssessment.claimsScore,
          propertyPoints: riskAssessment.propertyScore,
          totalPoints: riskAssessment.totalScore
        },
        discounts
      }
    };
  }
}
