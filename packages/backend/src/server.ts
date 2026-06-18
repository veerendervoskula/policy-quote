import { createApp } from './app.js';
import { logger } from './utils/logger.js';

const PORT = parseInt(process.env.PORT ?? '3333', 10);
const app = createApp();

app.listen(PORT, () => {
  logger.info(`PolicyQuote backend listening on http://localhost:${PORT}`);
  logger.info('Health check: GET http://localhost:3333/health');
  logger.info('Quote endpoint: POST http://localhost:3333/api/policy/quote');
});
