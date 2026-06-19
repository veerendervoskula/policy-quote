import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda';

import { QuoteRequestSchema } from './dto/QuoteRequest';
import { RiskScoringService } from './services/RiskScoringService';
import { logger } from './utils/logger';
import { PremiumCalculationService } from './services/PremiumCalculationService';
import { RISK_POINTS } from './utils/constants';

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {

  try {

    // Extract data from request
    const method = event.httpMethod;
    const path = event.path;
    const headers = event.headers;
    const query = event.queryStringParameters;
    let body: unknown;

    try {
      body = JSON.parse(event.body ?? '{}');
    } catch {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: 'VALIDATION_ERROR',
          message: 'Request body is not valid JSON',
          details:
            { body: ['Request body is not valid JSON'] }
        })
      };
    }

    logger.info("Incoming request:", {
      method,
      path,
      query,
      body,
    });

    const validated = QuoteRequestSchema.safeParse(body);

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

    const quoteResponse =
      PremiumCalculationService.generateQuoteResponse(
        request,
        riskAssessment
      );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quoteResponse)
    };

  } catch (error) {
    logger.error('Unexpected error', error
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