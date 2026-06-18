import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { forkJoin, Observable, retry, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PolicyQuoteRequest } from '../models/PolicyQuoteRequest';
import { PolicyQuoteResponse } from '../models/PolicyQuoteResponse';
import { environment } from '../../../environments/environment';

/**
 * PolicyQuoteApiService - Handles backend communication for policy quotes.
 * 
 * Endpoint: POST /api/policy/quote
 * Base URL: http://localhost:3333 (dev) or CORS_ORIGIN (prod)
 */
@Injectable({
  providedIn: 'root',
  useClass: PolicyQuoteApiService
})
export class PolicyQuoteApiService {

  constructor(private http: HttpClient) { }

  /**
   * Submits a policy quote request to the backend.
   * 
   * @param quoteData - Quote request data
   * @returns Observable of quote response
   */
   getQuote(
    quoteData: PolicyQuoteRequest
  ): Observable<PolicyQuoteResponse> {
    const url = `${environment.apiBaseUrl}${environment.apiEndpoints.quote}`;
    return this.http.post<PolicyQuoteResponse>(url, quoteData).pipe(
      map((response: PolicyQuoteResponse) => this.transformResponse(response)),
      catchError(this.handleError)
    );
  }

  getPremiumSeries(baseRequest: PolicyQuoteRequest) {
    const requests = [];

    for (let v = 100000; v <= 1000000; v += 100000) {
      requests.push(
        this.getQuote({
          ...baseRequest,
          dwellingValue: v
        }).pipe(
          map((res: PolicyQuoteResponse) => ({
            value: v,
            premium: res?.annualPremium
          }))
        )
      );
    }

    return forkJoin(requests);
  }

  private transformResponse(response: PolicyQuoteResponse): PolicyQuoteResponse {
    return {
      ...response,
      annualPremium: Number(response.annualPremium.toFixed(2)),
      monthlyPremium: Number(response.monthlyPremium.toFixed(2))
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Unexpected error';

    if (error.status === 0) {
      message = 'Network error check your connection';
    } else if (error.status >= 500) {
      message = 'Server error try again later';
    } else if (error.error?.message) {
      message = error.error.message;
    }

    return throwError(() => new Error(message));
  }
}
