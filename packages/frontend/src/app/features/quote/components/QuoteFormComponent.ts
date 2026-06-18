import { Component, Output, EventEmitter, signal, effect, computed,  DestroyRef, inject  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PolicyQuoteApiService } from '../../../core/services/PolicyQuoteApiService';
import { PolicyQuoteRequest } from '../../../core/models/PolicyQuoteRequest';
import { PolicyQuoteResponse } from '../../../core/models/PolicyQuoteResponse';
import { PropertyTypes } from 'src/app/core/utils/constants';

/**
 * QuoteFormComponent - Reactive form for policy quote data entry.
 * 
 * Form fields:
 * - name: Customer full name
 * - age: Customer age (18-100)
 * - propertyType: House, Flat, or Bungalow
 * - dwellingValue: Property value in £
 * - postcode: UK postcode
 * - priorClaims: Number of prior claims
 * 
 * Uses Angular Signals for all UI state:
 * - isLoading: Form submission loading state
 * - quoteResult: Quote result data
 * - errorMessage: Error message from API
 * 
 */
@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  template: `
  @if (errorMessage()) {
    <div
      class="banner banner-error"
      role="alert">

      <span>{{ errorMessage() }}</span>

      <button
        type="button"
        (click)="dismissBanner()"
        aria-label="Close notification">
        ✕
      </button>
    </div>
    }
    <form [formGroup]="quoteForm" (ngSubmit)="onSubmit()" class="quote-form card">
      <!-- Name -->
      <div class="form-group">
        <label for="name">Full Name</label>
        <input
          id="name"
          type="text"
          formControlName="name"
          placeholder="John Doe"
          [class.invalid]="isFieldInvalid('name')">
        @if (isFieldInvalid('name')) {
          <span class="error-message">{{ getErrorMessage('name') }}</span>
        }
      </div>

      <!-- Age and Property Type (2-col on desktop) -->
      <div class="form-row">
        <div class="form-group">
          <label for="age">Age</label>
          <input
            id="age"
            type="number"
            formControlName="age"
            placeholder="35"
            min="18"
            max="100"
            [class.invalid]="isFieldInvalid('age')">
          @if (isFieldInvalid('age')) {
            <span class="error-message">{{ getErrorMessage('age') }}</span>
          }
        </div>

        <div class="form-group">
          <label for="propertyType">Property Type</label>
            <select
        id="propertyType"
        formControlName="propertyType">

        @for(type of propertyTypes; track type) {
        <option [value]="type">
          {{ type }}
        </option>
        }
      </select>
          @if (isFieldInvalid('propertyType')) {
            <span class="error-message">{{ getErrorMessage('propertyType') }}</span>
          }
        </div>
      </div>

      <!-- Dwelling Value -->
      <div class="form-group">
        <label for="dwellingValue">Property Value (£)</label>
        <input
          id="dwellingValue"
          type="number"
          formControlName="dwellingValue"
          placeholder="300000"
          min="50000"
          [class.invalid]="isFieldInvalid('dwellingValue')">
        <small>Minimum £50,000, Maximum £2,000,000</small>
        @if (isFieldInvalid('dwellingValue')) {
          <span class="error-message">{{ getErrorMessage('dwellingValue') }}</span>
        }
      </div>

      <!-- Postcode and Prior Claims (2-col on desktop) -->
      <div class="form-row">
        <div class="form-group">
          <label for="postcode">Your Address/Eircode</label>
          <input
            id="postcode"
            type="text"
            formControlName="postcode"
            placeholder="Type address or Eircode"
            [class.invalid]="isFieldInvalid('postcode')">
          @if (isFieldInvalid('postcode')) {
            <span class="error-message">{{ getErrorMessage('postcode') }}</span>
          }
        </div>

        <div class="form-group">
          <label for="priorClaims">Prior Claims (5 years)</label>
          <input
            id="priorClaims"
            type="number"
            formControlName="priorClaims"
            placeholder="0"
            min="0"
            [class.invalid]="isFieldInvalid('priorClaims')">
          @if (isFieldInvalid('priorClaims')) {
            <span class="error-message">{{ getErrorMessage('priorClaims') }}</span>
          }
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="btn-submit btn-primary"
        [disabled]="isLoading() || quoteForm.invalid">
        @if (isLoading()) {
          <span class="spinner"></span>
          <span>Getting Your Quote...</span>
        } @else {
          <span>Get Instant Quote</span>
        }
      </button>
    </form>
  `,
  styles: [`
    .quote-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--spacing-md);

      @media (min-width: 640px) {
        grid-template-columns: 1fr 1fr;
      }
    }

    label {
      font-weight: 500;
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
    }

    input,
    select {
      padding: var(--spacing-md);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-base);
      transition: all var(--transition-fast);

      &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
      }

      &.invalid {
        border-color: var(--color-error);
        background-color: rgba(239, 68, 68, 0.05);
      }

      &:disabled {
        background-color: var(--color-bg-secondary);
        color: var(--color-text-muted);
        cursor: not-allowed;
      }
    }

    small {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .error-message {
      color: var(--color-error);
      font-size: var(--font-size-xs);
      font-weight: 500;
    }

    .btn-submit {
      padding: var(--spacing-md) var(--spacing-lg);
      font-size: var(--font-size-base);
      font-weight: 600;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      transition: all var(--transition-base);

      .spinner {
        width: 16px;
        height: 16px;
        border-width: 2px;
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  `]
})
export class QuoteFormComponent {
  @Output() resultEmitted = new EventEmitter<PolicyQuoteResponse>();
  @Output() errorEmitted = new EventEmitter<string>();

  quoteForm: FormGroup;
  isLoading = signal(false);
  quoteResult = signal<PolicyQuoteResponse | null>(null);
  errorMessage = signal<string | null>('');
  readonly propertyTypes = Object.values(PropertyTypes);
  readonly hasQuote = computed(() => this.quoteResult() !== null);
  private readonly destroyRef = inject(DestroyRef);

  constructor(private fb: FormBuilder, private apiService: PolicyQuoteApiService) {
    this.quoteForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      age: [null, [Validators.required, Validators.min(18), Validators.max(100)]],
      propertyType: ['', Validators.required],
      dwellingValue: [null, [Validators.required, Validators.min(50000), Validators.max(2000000)]],
      postcode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(8)]],
      priorClaims: [0, [Validators.required, Validators.min(0), Validators.max(10)]]
    });

    effect(() => {
      if (!this.errorMessage()) {
        return;
      }
      const timeout = setTimeout(() => {
        this.errorMessage.set(null);
      }, 20_000);

      return () => clearTimeout(timeout);
    });

  }

  onSubmit(): void {
    if (this.quoteForm.invalid) {
      this.quoteForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Cast form value to typed QuoteRequest
    const quoteRequest: PolicyQuoteRequest = this.quoteForm.value;

    // Use takeUntil to automatically unsubscribe when component is destroyed
    this.apiService.getQuote(quoteRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result: PolicyQuoteResponse) => {
          this.isLoading.set(false);
          this.quoteResult.set(result);
          this.resultEmitted.emit(result);
        },
        error: (error: any) => {
          this.isLoading.set(false);
          const errorMsg = error?.message ?? error?.error?.message ?? 'Failed to get quote. Please try again.';
          this.errorMessage.set(errorMsg);
          this.errorEmitted.emit(errorMsg);
        },
        complete: () => this.isLoading.set(false)
      });
  }

  dismissBanner(): void {
    this.errorMessage.set(null);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.quoteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.quoteForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('min')) {
      return `Minimum value: ${control.errors?.['min'].min}`;
    }
    if (control?.hasError('max')) {
      return `Maximum value: ${control.errors?.['max'].max}`;
    }
    if (control?.hasError('minlength')) {
      return `Minimum ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control?.hasError('maxlength')) {
      return `Maximum ${control.errors?.['maxlength'].requiredLength} characters`;
    }
    return 'Invalid input';
  }
}
