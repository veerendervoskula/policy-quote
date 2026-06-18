import helmet from 'helmet';
import cors from 'cors';
import { Express } from 'express';

/**
 * Configures security middleware for the Express app.
 * 
 * - Helmet: Sets security HTTP headers
 * - CORS: Allows cross-origin requests from frontend
 * 
 * @param app - Express app instance
 */
export function configureSecurity(app: Express): void {
  // Helmet provides protection against common vulnerabilities
  // (XSS, clickjacking, MIME-type sniffing, etc.)
  app.use(helmet());

  // CORS configuration for frontend communication
  // In production, restrict to specific frontend origin
  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:4200').split(',');
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('CORS policy violation'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  // Pre-flight request handling
  app.options('*', cors());
}
