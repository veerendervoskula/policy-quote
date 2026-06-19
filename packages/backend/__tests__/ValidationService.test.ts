import { ValidationService } from '../src/services/ValidationService';
import { ValidationError } from '../src/types/errors';

describe('ValidationService', () => {
  describe('validateRequest', () => {
    it('should validate a complete valid request', () => {
      const data = {
        name: 'John Doe',
        age: 35,
        propertyType: 'House',
        dwellingValue: 500000,
        postcode: 'M1 1AE',
        priorClaims: 0
      };
      const result = ValidationService.validateRequest(data);
      expect(result).toEqual({
        name: 'John Doe',
        age: 35,
        propertyType: 'House',
        dwellingValue: 500000,
        postcode: 'M1 1AE',
        priorClaims: 0
      });
    });

    it('should reject request with missing name', () => {
      const data = {
        age: 35,
        propertyType: 'House',
        dwellingValue: 500000,
        postcode: 'M1 1AE',
        priorClaims: 0
      };
      expect(() => ValidationService.validateRequest(data)).toThrow(ValidationError);
    });

    it('should reject request with invalid age', () => {
      const data = {
        name: 'John Doe',
        age: 15, // below minimum 18
        propertyType: 'House',
        dwellingValue: 500000,
        postcode: 'M1 1AE',
        priorClaims: 0
      };
      expect(() => ValidationService.validateRequest(data)).toThrow(ValidationError);
    });

    it('should reject request with invalid property type', () => {
      const data = {
        name: 'John Doe',
        age: 35,
        propertyType: 'Mansion', // invalid enum
        dwellingValue: 500000,
        postcode: 'M1 1AE',
        priorClaims: 0
      };
      expect(() => ValidationService.validateRequest(data)).toThrow(ValidationError);
    });

    it('should reject request with dwelling value too low', () => {
      const data = {
        name: 'John Doe',
        age: 35,
        propertyType: 'House',
        dwellingValue: 40000, // below minimum 50000
        postcode: 'M1 1AE',
        priorClaims: 0
      };
      expect(() => ValidationService.validateRequest(data)).toThrow(ValidationError);
    });

    it('should reject request with dwelling value too high', () => {
      const data = {
        name: 'John Doe',
        age: 35,
        propertyType: 'House',
        dwellingValue: 2500000, // above maximum 2000000
        postcode: 'M1 1AE',
        priorClaims: 0
      };
      expect(() => ValidationService.validateRequest(data)).toThrow(ValidationError);
    });

    it('should reject request with invalid postcode', () => {
      const data = {
        name: 'John Doe',
        age: 35,
        propertyType: 'House',
        dwellingValue: 500000,
        postcode: 'INVALID', // doesn't match UK postcode pattern
        priorClaims: 0
      };
      expect(() => ValidationService.validateRequest(data)).toThrow(ValidationError);
    });

    it('should reject request with negative prior claims', () => {
      const data = {
        name: 'John Doe',
        age: 35,
        propertyType: 'House',
        dwellingValue: 500000,
        postcode: 'M1 1AE',
        priorClaims: -1
      };
      expect(() => ValidationService.validateRequest(data)).toThrow(ValidationError);
    });

    it('should normalize postcode to uppercase', () => {
      const data = {
        name: 'John Doe',
        age: 35,
        propertyType: 'House',
        dwellingValue: 500000,
        postcode: 'm1 1ae', // lowercase
        priorClaims: 0
      };
      const result = ValidationService.validateRequest(data);
      expect(result.postcode).toBe('M1 1AE');
    });

    it('should trim whitespace from name and postcode', () => {
      const data = {
        name: '  John Doe  ',
        age: 35,
        propertyType: 'House',
        dwellingValue: 500000,
        postcode: '  M1 1AE  ', // whitespace around valid postcode
        priorClaims: 0
      };
      const result = ValidationService.validateRequest(data);
      expect(result.name).toBe('John Doe');
      expect(result.postcode).toBe('M1 1AE');
    });
  });
});
