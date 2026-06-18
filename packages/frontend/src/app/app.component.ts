import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { QuotePageComponent } from './features/quote/QuotePageComponent';
import { ThemeService } from './core/services/ThemeService';

/**
 * AppComponent - Root component for PolicyQuote application.
 * 
 * Responsibilities:
 * - Initialize theme service
 * - Render quote page
 * - Provide theme toggle in header
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, QuotePageComponent],
  template: `
    <div class="app">
      <header class="app-header">
        <div class="header-content">
          <h1 class="logo">PolicyQuote</h1>
          <button class="theme-toggle" (click)="toggleTheme()" [title]="'Switch to ' + (themeService.currentTheme() === 'light' ? 'dark' : 'light') + ' theme'">
            @if (themeService.currentTheme() === 'light') {
              <span>🌙 Dark</span>
            } @else {
              <span>☀️ Light</span>
            }
          </button>
        </div>
      </header>

      <main class="app-main">
        <app-quote-page></app-quote-page>
      </main>

      <footer class="app-footer">
        <p>&copy; 2026 PolicyQuote. All rights reserved. Demo application.</p>
      </footer>
    </div>
  `,
  styles: [`
    .app {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: var(--color-bg-primary);
      transition: background-color var(--transition-base);
    }

    .app-header {
      background-color: var(--color-bg-secondary);
      border-bottom: 1px solid var(--color-border);
      padding: var(--spacing-md) 0;
      box-shadow: var(--shadow-sm);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 var(--spacing-md);
      display: flex;
      align-items: center;
      justify-content: space-between;

      @media (min-width: 640px) {
        padding: 0 var(--spacing-lg);
      }
    }

    .logo {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--color-primary);
      margin: 0;
      letter-spacing: -0.5px;
    }

    .theme-toggle {
      padding: var(--spacing-sm) var(--spacing-md);
      background-color: var(--color-bg-primary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--color-text-primary);
      transition: all var(--transition-fast);

      &:hover {
        background-color: var(--color-bg-primary);
        box-shadow: var(--shadow-sm);
      }

      &:focus {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }

      span {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-sm);
      }
    }

    .app-main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .app-footer {
      background-color: var(--color-bg-secondary);
      border-top: 1px solid var(--color-border);
      padding: var(--spacing-lg) var(--spacing-md);
      text-align: center;
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);

      p {
        margin: 0;
      }
    }

    @media (max-width: 640px) {
      .logo {
        font-size: var(--font-size-lg);
      }

      .header-content {
        padding: 0 var(--spacing-sm);
      }
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {
    // Theme is initialized by ThemeService constructor
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
