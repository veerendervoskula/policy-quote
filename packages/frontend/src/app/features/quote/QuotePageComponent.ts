import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuoteFormComponent } from './components/QuoteFormComponent';
import { QuoteResultComponent } from './components/QuoteResultComponent';
import { PolicyQuoteResponse } from '../../core/models/PolicyQuoteResponse';

/**
 * QuotePageComponent - Main container for the quote flow.
 * 
 * Manages:
 * - Form submission state (loading, error)
 * - Quote result display
 * - Form/result view toggle
 * 
 * Uses Angular Signals with computed derived state for reactive state management.
 * No NgRx needed for this simple state tree.
 */
@Component({
  selector: 'app-quote-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QuoteFormComponent, QuoteResultComponent],
  template: `
    <div class="quote-page">
      <div class="quote-container">
        @if (!showResult()) {
          <div class="quote-form-section">
            <h1>Home Insurance Quote</h1>
            <p class="subtitle">Get an instant premium estimate with our risk assessment</p>
            <app-quote-form 
              (resultEmitted)="onQuoteResult($event)"
              (errorEmitted)="onError($event)">
            </app-quote-form>
          </div>
        } @else {
          <div class="quote-result-section">
            <button class="btn-back" (click)="resetForm()">← Back to Form</button>
            <app-quote-result [quoteResult]="quoteResult()"></app-quote-result>
          </div>
        }

        @if (errorMessage()) {
          <div class="alert alert-error mt-lg">
            <strong>Error:</strong> {{ errorMessage() }}
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .quote-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-lg);
      background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
    }

    .quote-container {
      width: 100%;
      max-width: 600px;
    }

    .quote-form-section,
    .quote-result-section {
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    h1 {
      text-align: center;
      margin-bottom: var(--spacing-md);
    }

    .subtitle {
      text-align: center;
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-lg);
    }

    .btn-back {
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-sm);
      background-color: transparent;
      color: var(--color-primary);
      border: 1px solid var(--color-border);
      cursor: pointer;

      &:hover {
        background-color: var(--color-bg-secondary);
      }
    }

    @media (max-width: 640px) {
      .quote-page {
        padding: var(--spacing-md);
      }

      .quote-container {
        max-width: 100%;
      }

      h1 {
        font-size: var(--font-size-2xl);
      }
    }
  `]
})
export class QuotePageComponent {
  showResult = signal(false);
  quoteResult = signal<PolicyQuoteResponse | null>(null);
  errorMessage = signal('');

  /**
   * Computed signal: Determines if there's any error to display.
   * Automatically updates when errorMessage changes.
   */
  hasError = computed(() => !!this.errorMessage());

  /**
   * Computed signal: Determines which view to show (form or result).
   * Automatically updates when showResult or quoteResult changes.
   */
  shouldShowForm = computed(() => !this.showResult() || !this.quoteResult());

  onQuoteResult(result: PolicyQuoteResponse): void {
    this.quoteResult.set(result);
    this.showResult.set(true);
    this.errorMessage.set('');
  }

  onError(error: string): void {
    this.errorMessage.set(error);
    this.showResult.set(false);
  }

  resetForm(): void {
    this.showResult.set(false);
    this.quoteResult.set(null);
    this.errorMessage.set('');
  }
}
