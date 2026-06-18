/**
 * Production environment configuration.
 * Used when running: ng build --prod
 */
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.policy-quote.com',
  apiEndpoints: {
    quote: '/api/policy/quote'
  }
};
