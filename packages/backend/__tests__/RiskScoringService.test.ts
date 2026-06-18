import { RiskScoringService } from '../src/services/RiskScoringService.js';

describe('RiskScoringService', () => {
  describe('calculateAgeScore', () => {
    it('should return 20 points for age under 25', () => {
      expect(RiskScoringService.calculateAgeScore(24)).toBe(20);
      expect(RiskScoringService.calculateAgeScore(18)).toBe(20);
    });

    it('should return 20 points for age over 75', () => {
      expect(RiskScoringService.calculateAgeScore(76)).toBe(20);
      expect(RiskScoringService.calculateAgeScore(85)).toBe(20);
    });

    it('should return 0 points for age 25-75 (standard risk)', () => {
      expect(RiskScoringService.calculateAgeScore(25)).toBe(0);
      expect(RiskScoringService.calculateAgeScore(50)).toBe(0);
      expect(RiskScoringService.calculateAgeScore(75)).toBe(0);
    });
  });

  describe('calculateClaimsScore', () => {
    it('should return 0 points for no prior claims', () => {
      expect(RiskScoringService.calculateClaimsScore(0)).toBe(0);
    });

    it('should return 15 points per claim for 1-2 prior claims', () => {
      expect(RiskScoringService.calculateClaimsScore(1)).toBe(15);
      expect(RiskScoringService.calculateClaimsScore(2)).toBe(30);
    });

    it('should return 30 points per claim for 3+ prior claims', () => {
      expect(RiskScoringService.calculateClaimsScore(3)).toBe(90);
      expect(RiskScoringService.calculateClaimsScore(4)).toBe(120);
      expect(RiskScoringService.calculateClaimsScore(5)).toBe(150);
    });
  });

  describe('calculatePropertyScore', () => {
    it('should return 0 points for house under £750k', () => {
      expect(RiskScoringService.calculatePropertyScore('House', 500000)).toBe(0);
    });

    it('should return 10 points for flat (regardless of value)', () => {
      expect(RiskScoringService.calculatePropertyScore('Flat', 300000)).toBe(10);
    });

    it('should return 25 points for property over £750k', () => {
      expect(RiskScoringService.calculatePropertyScore('House', 800000)).toBe(25);
      expect(RiskScoringService.calculatePropertyScore('Bungalow', 1000000)).toBe(25);
    });

    it('should return 35 points for flat over £750k (combined penalties)', () => {
      expect(RiskScoringService.calculatePropertyScore('Flat', 800000)).toBe(35);
    });
  });

  describe('computeTotalRiskScore', () => {
    it('should map 0-25 points to STANDARD risk band', () => {
      const result = RiskScoringService.computeTotalRiskScore(0, 0, 0);
      expect(result.score).toBe(0);
      expect(result.riskBand).toBe('STANDARD');

      const result2 = RiskScoringService.computeTotalRiskScore(10, 10, 5);
      expect(result2.score).toBe(25);
      expect(result2.riskBand).toBe('STANDARD');
    });

    it('should map 26-60 points to ELEVATED risk band', () => {
      const result = RiskScoringService.computeTotalRiskScore(20, 15, 0);
      expect(result.score).toBe(35);
      expect(result.riskBand).toBe('ELEVATED');

      const result2 = RiskScoringService.computeTotalRiskScore(20, 30, 10);
      expect(result2.score).toBe(60);
      expect(result2.riskBand).toBe('ELEVATED');
    });

    it('should map 61+ points to HIGH_RISK band', () => {
      const result = RiskScoringService.computeTotalRiskScore(20, 30, 15);
      expect(result.score).toBe(65);
      expect(result.riskBand).toBe('HIGH_RISK');

      const result2 = RiskScoringService.computeTotalRiskScore(20, 90, 25);
      expect(result2.score).toBe(135);
      expect(result2.riskBand).toBe('HIGH_RISK');
    });
  });

  describe('assessRisk', () => {
    it('should classify a young homebuyer as STANDARD', () => {
      const request: typeof RiskScoringService.assessRisk extends (arg: infer T) => any ? T : never = {
        name: 'John Doe',
        age: 30,
        propertyType: 'House' as const,
        dwellingValue: 300000,
        postcode: 'M1 1AE',
        priorClaims: 0
      };
      const assessment = RiskScoringService.assessRisk(request);

      expect(assessment.ageScore).toBe(0);
      expect(assessment.claimsScore).toBe(0);
      expect(assessment.propertyScore).toBe(0);
      expect(assessment.totalScore).toBe(0);
      expect(assessment.riskBand).toBe('STANDARD');
    });

    it('should classify a young flat owner with claims as ELEVATED', () => {
      const request = {
        name: 'Jane Smith',
        age: 24,
        propertyType: 'Flat' as const,
        dwellingValue: 400000,
        postcode: 'SW1A 1AA',
        priorClaims: 1
      };
      const assessment = RiskScoringService.assessRisk(request);

      expect(assessment.ageScore).toBe(20);
      expect(assessment.claimsScore).toBe(15);
      expect(assessment.propertyScore).toBe(10);
      expect(assessment.totalScore).toBe(45);
      expect(assessment.riskBand).toBe('ELEVATED');
    });

    it('should classify a senior with high-value flat as HIGH_RISK', () => {
      const request = {
        name: 'Robert Green',
        age: 78,
        propertyType: 'Flat' as const,
        dwellingValue: 900000,
        postcode: 'EC1A 1BB',
        priorClaims: 2
      };
      const assessment = RiskScoringService.assessRisk(request);

      expect(assessment.ageScore).toBe(20);
      expect(assessment.claimsScore).toBe(30);
      expect(assessment.propertyScore).toBe(35);
      expect(assessment.totalScore).toBe(85);
      expect(assessment.riskBand).toBe('HIGH_RISK');
    });
  });
});
