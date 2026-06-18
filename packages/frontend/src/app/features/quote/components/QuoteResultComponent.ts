import { Component, effect, ElementRef, Input, viewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RiskBandBadgeComponent } from '../../../shared/components/RiskBandBadgeComponent';
import { PolicyQuoteResponse } from '../../../core/models/PolicyQuoteResponse';
import { PremiumHistoryChartComponent } from './QuoteChartComponent';

/**
 * QuoteResultComponent - Displays policy quote results.
 * 
 * Shows:
 * - Monthly and annual premiums (£ formatted)
 * - Risk band badge (STANDARD, ELEVATED, HIGH_RISK)
 * - Plain-text risk summary
 * - Coverage breakdown and applied factors
 * 
 * Accepts typed QuoteResponse input for type-safe data binding.
 * Responsive layout: Stacked on mobile, side-by-side on desktop.
 */
@Component({
  selector: 'app-quote-result',
  standalone: true,
  imports: [CommonModule, RiskBandBadgeComponent, PremiumHistoryChartComponent],
  template: `
    @if (quoteResult) {
      <div class="quote-result card">
        <div class="result-header">
          <div>
            <h2 class="mb-md">Your Policy Quote</h2>
            <p class="subtitle">Instant premium estimate with risk assessment</p>
          </div>
        </div>

        <!-- Premium Section -->
        <div class="premium-section card-nested">
          <div class="premium-items">
            <div class="premium-item">
              <span class="label">Monthly Premium</span>
              <span class="value">£{{ quoteResult.monthlyPremium | number: '1.0-0' }}</span>
            </div>
            <div class="separator"></div>
            <div class="premium-item">
              <span class="label">Annual Premium</span>
              <span class="value annual">£{{ quoteResult.annualPremium | number: '1.0-0' }}</span>
            </div>
          </div>
        </div>

        <!-- Risk Assessment Section -->
        <div class="risk-section">
          <h3>Risk Assessment</h3>
          <div class="risk-grid">
            <div class="risk-item">
              <span class="risk-label">Your Risk Band</span>
              <app-risk-band-badge [riskBand]="quoteResult.riskBand"></app-risk-band-badge>
            </div>
            <div class="risk-item">
              <span class="risk-label">Risk Score</span>
              <span class="risk-score">{{ quoteResult.riskScore }}</span>
            </div>
          </div>
        </div>

        <!-- Summary Section -->
        <div class="summary-section">
          <h3>Summary</h3>
          <p>{{ quoteResult.riskSummary }}</p>
        </div>

        <!-- Coverage Details -->
        <div class="details-section">
          <h3>Coverage Details</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Base Annual Rate</span>
              <span class="detail-value">£{{ quoteResult.coverageDetails.baseAnnualRate | number: '1.0-0' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Risk Multiplier</span>
              <span class="detail-value">{{ quoteResult.coverageDetails.riskMultiplier | number: '1.0-2f' }}x</span>
            </div>
          </div>

          <div class="factors-section">
            <h4>Applied Factors</h4>
            <ul class="factors-list">
              <li>Age Points: +{{ quoteResult.coverageDetails.appliedFactors.agePoints }}</li>
              <li>Claims Points: +{{ quoteResult.coverageDetails.appliedFactors.claimsPoints }}</li>
              <li>Property Points: +{{ quoteResult.coverageDetails.appliedFactors.propertyPoints }}</li>
              <li><strong>Total Risk Points: {{ quoteResult.coverageDetails.appliedFactors.totalPoints }}</strong></li>
            </ul>
          </div>

          @if (quoteResult.coverageDetails.discounts.length > 0) {
            <div class="discounts-section">
              <h4>Applied Discounts</h4>
              <ul class="discounts-list">
                @for (discount of quoteResult.coverageDetails.discounts; track discount.description) {
                  <li>{{ discount.description }}: -{{ discount.percentage }}%</li>
                }
              </ul>
            </div>
          }
        </div>
        <div>
        <app-premium-history-chart
              [annualPremium]="quoteResult!.annualPremium"
              [riskScore]="quoteResult!.riskScore">
            </app-premium-history-chart>
        </div>
        <!-- Call to Action -->
        <div class="cta-section">
          <p class="cta-text">Ready to get covered? Next step: complete your full application.</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .quote-result {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .result-header {
      text-align: center;
    }

    h2 {
      margin-bottom: var(--spacing-sm);
    }

    .subtitle {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    .premium-section {
      background-color: var(--color-bg-primary);
      padding: var(--spacing-lg);
      border-radius: var(--radius-lg);
      border: 2px solid var(--color-primary);
    }

    .premium-items {
      display: flex;
      align-items: center;
      justify-content: space-around;
    }

    .premium-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    .value {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--color-primary);

      &.annual {
        font-size: var(--font-size-3xl);
      }
    }

    .separator {
      width: 1px;
      height: 60px;
      background-color: var(--color-border);
    }

    .risk-section {
      padding: var(--spacing-md) 0;

      h3 {
        margin-bottom: var(--spacing-md);
        font-size: var(--font-size-lg);
      }
    }

    .risk-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);
    }

    .risk-item {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background-color: var(--color-bg-secondary);
      border-radius: var(--radius-md);
      align-items: center;
      text-align: center;
    }

    .risk-label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    .risk-score {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--color-primary);
    }

    .summary-section {
      padding: var(--spacing-md);
      background-color: var(--color-bg-secondary);
      border-radius: var(--radius-md);

      h3 {
        margin-bottom: var(--spacing-md);
        font-size: var(--font-size-lg);
      }

      p {
        line-height: var(--line-height-relaxed);
        color: var(--color-text-primary);
        margin: 0;
      }
    }

    .details-section {
      border-top: 1px solid var(--color-border);
      padding-top: var(--spacing-lg);

      h3 {
        margin-bottom: var(--spacing-md);
        font-size: var(--font-size-lg);
      }

      h4 {
        margin-top: var(--spacing-md);
        margin-bottom: var(--spacing-sm);
        font-size: var(--font-size-base);
      }
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background-color: var(--color-bg-secondary);
      border-radius: var(--radius-md);
    }

    .detail-label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    .detail-value {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--color-primary);
    }

    .factors-list,
    .discounts-list {
      list-style: none;
      padding: var(--spacing-md);
      background-color: var(--color-bg-secondary);
      border-radius: var(--radius-md);

      li {
        padding: var(--spacing-sm) 0;
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);

        strong {
          color: var(--color-text-primary);
          font-weight: 600;
        }
      }
    }

    .cta-section {
      text-align: center;
      padding: var(--spacing-lg);
      background: linear-gradient(135deg, var(--color-bg-secondary), transparent);
      border-radius: var(--radius-lg);
      border: 1px dashed var(--color-border);
    }

    .cta-text {
      margin: 0;
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    @media (max-width: 640px) {
      .premium-items {
        flex-direction: column;
        gap: var(--spacing-lg);
      }

      .separator {
        width: 60px;
        height: 1px;
      }

      .risk-grid {
        grid-template-columns: 1fr;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }

      .value {
        font-size: var(--font-size-xl);

        &.annual {
          font-size: var(--font-size-2xl);
        }
      }
    }
  `]
})
export class QuoteResultComponent {
  @Input() quoteResult!: PolicyQuoteResponse | null;
}
