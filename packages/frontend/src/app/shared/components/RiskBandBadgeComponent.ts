import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskBand } from 'src/app/core/models/PolicyQuoteResponse';

/**
 * RiskBandBadgeComponent - Reusable risk band status badge.
 * 
 * Displays a color-coded badge showing the customer's risk classification:
 * - STANDARD: Green (preferred risk)
 * - ELEVATED: Orange (moderate risk)
 * - HIGH_RISK: Red (significant risk)
 * 
 * Features:
 * - Responsive sizing
 * - Light/dark theme aware
 * - Accessible contrast ratios
 * 
 * Usage:
 * <app-risk-band-badge [riskBand]="'STANDARD'"></app-risk-band-badge>
 */
@Component({
  selector: 'app-risk-band-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="badge" [ngClass]="'badge-' + (riskBand | lowercase)">
      <span class="badge-label">{{ getRiskLabel(riskBand) }}</span>
    </div>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: var(--font-size-sm);
      letter-spacing: 0.5px;
      text-transform: uppercase;
      white-space: nowrap;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-base);

      &:hover {
        box-shadow: var(--shadow-md);
      }

      &-standard {
        background-color: var(--color-risk-standard-bg);
        color: var(--color-risk-standard);
        border: 1px solid var(--color-risk-standard);
      }

      &-elevated {
        background-color: var(--color-risk-elevated-bg);
        color: var(--color-risk-elevated);
        border: 1px solid var(--color-risk-elevated);
      }

      &-high_risk {
        background-color: var(--color-risk-high-bg);
        color: var(--color-risk-high);
        border: 1px solid var(--color-risk-high);
      }
    }

    .badge-label {
      font-weight: 700;
    }

    @media (max-width: 640px) {
      .badge {
        padding: var(--spacing-sm) var(--spacing-md);
        font-size: var(--font-size-xs);
      }
    }
  `]
})
export class RiskBandBadgeComponent {
  /**
   * Risk band classification from backend
   */
  @Input() riskBand: RiskBand= 'STANDARD';

  /**
   * Maps risk band to display label
   */
  getRiskLabel(band: string): string {
    const labels: Record<string, string> = {
      STANDARD: 'Standard Risk',
      ELEVATED: 'Elevated Risk',
      HIGH_RISK: 'High Risk'
    };
    return labels[band] ?? 'Unknown';
  }
}
