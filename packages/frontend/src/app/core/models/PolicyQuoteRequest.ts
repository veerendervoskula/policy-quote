import { PropertyType } from "../utils/constants";

/**
 * QuoteRequest interface - Mirrors backend DTO.
 * Typed request for policy quote API.
 */
export interface PolicyQuoteRequest {
  name: string;
  age: number;
  propertyType: PropertyType;
  dwellingValue: number;
  postcode: string;
  priorClaims: number;
}
