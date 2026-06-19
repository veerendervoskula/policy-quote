import { Router } from 'express';
import { handler } from '../lambda';
import { asyncHandler } from '../middleware/errorHandler';
import type {
  APIGatewayProxyEvent,
  Context
} from 'aws-lambda';

export const quoteRoutes = Router();

quoteRoutes.post(
  '/policy/quote',
  asyncHandler(async (req, res) => {
    const result =
      await handler(
        {
          body: JSON.stringify(req.body),
          httpMethod: req.method,
          path: req.path,
          headers: req.headers,
          queryStringParameters: req.query
        } as APIGatewayProxyEvent,
        {} as Context
      );

    res
      .status(result.statusCode)
      .json(
        JSON.parse(result.body)
      );
  })
);
