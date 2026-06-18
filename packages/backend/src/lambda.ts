import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from 'aws-lambda';

import { QuoteRequestSchema } from './dto/QuoteRequest';
import { RiskScoringService } from './services/RiskScoringService';
import { logger } from './utils/logger';
import { PremiumCalculationService } from './services/PremiumCalculationService';

export async function handler(
event: APIGatewayProxyEvent, p0: any): Promise<APIGatewayProxyResult> {

  try {

    const payload = JSON.parse(
      event.body ?? '{}'
    );

    const validated =
      QuoteRequestSchema.safeParse(payload);

    if (!validated.success) {

      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: 'VALIDATION_ERROR',
          message: 'Invalid quote request',
          details:
            validated.error.flatten().fieldErrors
        })
      };
    }

    const request = validated.data;

    const riskAssessment =
      RiskScoringService.assessRisk(
        request
      );

    const premium =
      PremiumCalculationService.calculatePremium(
        request.dwellingValue,
        riskAssessment.riskBand
      );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        annualPremium: premium.annualPremium,
        monthlyPremium: premium.monthlyPremium,
        riskScore: riskAssessment.totalScore,

        riskBand:
          riskAssessment.riskBand,

        riskBreakdown: {
          ageScore:
            riskAssessment.ageScore,
          claimsScore:
            riskAssessment.claimsScore,
          propertyScore:
            riskAssessment.propertyScore
        },

        coverageDetails: {
          buildingCover:
            request.dwellingValue,
          contentsCover: 75000,
          accidentalDamage: true
        }
      })
    };

  } catch (error) {

    logger.error(
      'Unexpected error',
      error
    );

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'An unexpected error occurred'
      })
    };
  }
}