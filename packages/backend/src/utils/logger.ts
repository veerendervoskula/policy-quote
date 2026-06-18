import winston from 'winston';

/**
 * Logger utility - Winston-based logging for structured output.
 * 
 * Features:
 * - Console output with color coding and timestamps
 * - Error, warn, info, debug levels
 * - Suitable for both local dev and production Lambda environments
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
            return `${timestamp} [${level}]: ${message}${metaStr}`;
          })
        )
  ),
  transports: [new winston.transports.Console()],
  exceptionHandlers: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ message }) => `UNCAUGHT EXCEPTION: ${message}`)
      )
    })
  ]
});

/**
 * Request logger middleware - logs incoming requests and response timing.
 * 
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export function requestLogger(req: any, res: any, next: any): void {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    res.send = originalSend;
    return res.send(data);
  };

  next();
}
