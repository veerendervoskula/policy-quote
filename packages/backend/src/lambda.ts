import { createApp } from './app.js';
import { logger } from './utils/logger.js';

// AWS Lambda handler for Node.js 18+ runtime
// Compatible with API Gateway (REST API and HTTP API) and ALB

const app = createApp();

/**
 * Lambda handler function for AWS Lambda Node.js runtime.
 * 
 * Supports:
 * - API Gateway HTTP API events
 * - API Gateway REST API events
 * - Application Load Balancer (ALB) events
 * 
 * The serverless middleware internally handles event format conversion.
 * 
 * @param event - AWS Lambda event (from API Gateway or ALB)
 * @param _context - AWS Lambda context (unused but required for Lambda signature)
 * @returns Response object with statusCode and body
 */
export const handler = async (event: any, _context: any) => {
  logger.info('Lambda handler invoked', {
    path: event.path ?? event.rawPath,
    method: event.httpMethod ?? event.requestContext?.http?.method
  });

  try {
    // Convert Lambda event to Express-compatible request
    const httpMethod = event.httpMethod ?? event.requestContext?.http?.method ?? 'GET';
    const path = event.path ?? event.rawPath ?? '/';
    const headers = event.headers ?? {};
    const body = event.body ?? null;
    const isBase64 = event.isBase64Encoded ?? false;

    // Parse body if present
    let bodyData: any = null;
    if (body) {
      try {
        const decodedBody = isBase64 ? Buffer.from(body, 'base64').toString('utf-8') : body;
        bodyData = JSON.parse(decodedBody);
      } catch {
        // Non-JSON body, treat as string
        bodyData = body;
      }
    }

    // Create a minimal request object for Express
    const mockReq: any = {
      method: httpMethod,
      path,
      url: path,
      headers,
      body: bodyData,
      query: event.queryStringParameters ?? {},
      params: event.pathParameters ?? {}
    };

    // Create a minimal response object
    const responses: any[] = [];
    const mockRes: any = {
      statusCode: 200,
      headers: {},
      body: '',
      status: function (code: number) {
        this.statusCode = code;
        return this;
      },
      json: function (data: any) {
        this.body = JSON.stringify(data);
        this.headers['Content-Type'] = 'application/json';
        responses.push(this);
        return this;
      },
      send: function (data: any) {
        this.body = data;
        responses.push(this);
        return this;
      }
    };

    // Route through Express app
    return new Promise((resolve, reject) => {
      app(mockReq, mockRes, (err: any) => {
        if (err) {
          reject(err);
        } else {
          const response = responses[responses.length - 1] || mockRes;
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            body: response.body,
            isBase64Encoded: false
          });
        }
      });
    });
  } catch (error) {
    logger.error('Lambda handler error', { error });
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'LAMBDA_ERROR',
        message: 'Internal server error'
      })
    };
  }
};
