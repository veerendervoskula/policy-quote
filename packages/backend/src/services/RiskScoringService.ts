import { QuoteRequest } from '../dto/QuoteRequest.js';

/**
 * RiskScoringService - Implements deterministic underwriting risk assessment.
 * 
 * This service calculates risk points based on actuarial factors:
 * - Age profile (under 25 or over 75 adds risk)
 * - Claims history (prior claims indicate higher risk)
 * - Property characteristics (flats have shared risk exposure; high values require more coverage)
 * 
 * The risk score is mapped to a band: STANDARD (0-25), ELEVATED (26-60), HIGH_RISK (61+)
 * 
 * Assumptions:
 * - All scoring is deterministic (no external data sources)
 * - Points are additive across factors
 * - Risk band determines underwriting disposition and premium loading
 */
export class RiskScoringService {
  /**
   * Calculates risk points based on age profile.
   * 
   * Underwriting rationale:
   * - Age <25: Inexperience and higher accident rates → +20 points
   * - Age 25-75: Stable middle-age cohort with acceptable risk → +0 points
   * - Age >75: Increased likelihood of claims, reduced mobility → +20 points
   * 
   * @param age - Customer age in years
   * @returns Risk points (0 or 20)
   */
  public static calculateAgeScore(age: number): number {
    if (age < 25 || age > 75) {
      return 20;
    }
    return 0;
  }

  /**
   * Calculates risk points based on prior claim history.
   * 
   * Underwriting rationale:
   * - 0 claims: No loss history indicates good property stewardship → +0 points
   * - 1-2 claims: Each claim adds risk of recurrence → +15 points per claim
   * - 3+ claims: Pattern of loss indicates elevated exposure → +30 points per claim
   * 
   * @param priorClaims - Number of claims in past 5 years
   * @returns Risk points (0, 15, 30 per claim, or more)
   */
  public static calculateClaimsScore(priorClaims: number): number {
    if (priorClaims === 0) {
      return 0;
    }
    if (priorClaims <= 2) {
      return priorClaims * 15;
    }
    // 3+ claims: 30 points per claim
    return priorClaims * 30;
  }

  /**
   * Calculates risk points based on property type and value.
   * 
   * Underwriting rationale:
   * - Property type:
   *   - Flats: Shared walls, common areas, potential liability from neighbors → +10 points
   *   - Houses/Bungalows: Standalone exposure, full responsibility → +0 points
   * - Property value:
   *   - >£750,000: High-value properties require more coverage, greater loss potential → +25 points
   *   - ≤£750,000: Standard coverage adequacy → +0 points
   * 
   * @param propertyType - Type of dwelling
   * @param dwellingValue - Total property value in £
   * @returns Risk points (0, 10, 25, or 35)
   */
  public static calculatePropertyScore(propertyType: string, dwellingValue: number): number {
    let score = 0;

    // Flat penalty
    if (propertyType.toLowerCase() === 'flat') {
      score += 10;
    }

    // High-value property penalty
    if (dwellingValue > 750000) {
      score += 25;
    }

    return score;
  }

  /**
   * Computes total risk score and maps to risk band.
   * 
   * Risk bands:
   * - 0-25 points: STANDARD risk (typical customer profile)
   * - 26-60 points: ELEVATED risk (multiple minor risk factors)
   * - 61+ points: HIGH_RISK (significant risk accumulation)
   * 
   * @param ageScore - Points from age assessment
   * @param claimsScore - Points from claims history
   * @param propertyScore - Points from property assessment
   * @returns Object with total score and corresponding risk band
   */
  public static computeTotalRiskScore(
    ageScore: number,
    claimsScore: number,
    propertyScore: number
  ): { score: number; riskBand: 'STANDARD' | 'ELEVATED' | 'HIGH_RISK' } {
    const totalScore = ageScore + claimsScore + propertyScore;

    let riskBand: 'STANDARD' | 'ELEVATED' | 'HIGH_RISK';
    if (totalScore <= 25) {
      riskBand = 'STANDARD';
    } else if (totalScore <= 60) {
      riskBand = 'ELEVATED';
    } else {
      riskBand = 'HIGH_RISK';
    }

    return { score: totalScore, riskBand };
  }

  /**
   * Orchestrates complete risk assessment for a quote request.
   * 
   * @param request - Validated quote request
   * @returns Risk assessment with individual factor scores and band
   */
  public static assessRisk(request: QuoteRequest): {
    ageScore: number;
    claimsScore: number;
    propertyScore: number;
    totalScore: number;
    riskBand: 'STANDARD' | 'ELEVATED' | 'HIGH_RISK';
  } {
    const ageScore = this.calculateAgeScore(request.age);
    const claimsScore = this.calculateClaimsScore(request.priorClaims);
    const propertyScore = this.calculatePropertyScore(request.propertyType, request.dwellingValue);
    const { score: totalScore, riskBand } = this.computeTotalRiskScore(
      ageScore,
      claimsScore,
      propertyScore
    );

    return {
      ageScore,
      claimsScore,
      propertyScore,
      totalScore,
      riskBand
    };
  }
}
