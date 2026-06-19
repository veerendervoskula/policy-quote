import express, { Express } from 'express';
import { errorHandler } from './middleware/errorHandler';
import { configureSecurity } from './middleware/security';
import { requestLogger } from './utils/logger';
import { quoteRoutes } from './routes/quote.routes';

/**
 * Creates and configures an Express application instance.
 * 
 * Middleware stack (in order):
 * 1. Security (Helmet, CORS)
 * 2. JSON body parser
 * 3. Request logger
 * 4. Application routes
 * 5. Error handler (catches all errors)
 * 
 * @returns Configured Express app
 */
export function createApp(): Express {
  const app = express();

  // Security middleware
  configureSecurity(app);

  // Body parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ limit: '10kb', extended: true }));

  // Request logging
  app.use(requestLogger);

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'PolicyQuote Backend',
      timestamp: new Date().toISOString()
    });
  });

  // API routes
  app.use('/api', quoteRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    });
  });

  // Centralized error handler (must be last)
  app.use(errorHandler);
  return app;
}
