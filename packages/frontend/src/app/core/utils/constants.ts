
export const API_ENDPOINTS = {
  QUOTE: '/policy/quote'
};

export const RISK_COLORS = {
  STANDARD: '#2e7d32',
  ELEVATED: '#f9a825',
  HIGH_RISK: '#c62828'
};

export const PREMIUM_CONSTANTS = {
  BASE_RATE: 0.003,
  CLAIM_MULTIPLIER: 0.15,
  AGE_LOADING: 0.10,
  HIGH_VALUE_THRESHOLD: 750000,
  POSTCODE_HIGH_RISK_PREFIXES: ['E', 'B', 'M']
} as const;

export enum PropertyTypes {
  HOUSE = 'HOUSE',
  FLAT = 'FLAT',
  BUNGALOW = 'BUNGALOW'
}

export enum RiskBand {
  STANDARD = 'STANDARD',
  ELEVATED = 'ELEVATED',
  HIGH_RISK = 'HIGH_RISK'
}