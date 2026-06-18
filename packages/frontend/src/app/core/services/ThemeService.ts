import { Injectable, signal } from '@angular/core';

/**
 * ThemeService - Manages light/dark theme switching.
 * 
 * Features:
 * - Toggle between light and dark themes
 * - Persist theme preference to localStorage
 * - Apply theme via data-theme attribute on html element
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'policy-quote-theme';
  private readonly DARK_THEME = 'dark';
  private readonly LIGHT_THEME = 'light';

  currentTheme = signal<'light' | 'dark'>(this.getInitialTheme());

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  /**
   * Gets the initial theme from localStorage or system preference.
   */
  private getInitialTheme(): 'light' | 'dark' {
    // Check localStorage
    const savedTheme = localStorage.getItem(this.THEME_KEY) as 'light' | 'dark' | null;
    if (savedTheme) {
      return savedTheme;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return this.DARK_THEME as 'dark';
    }

    return this.LIGHT_THEME as 'light';
  }

  /**
   * Toggles the theme and updates UI.
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(newTheme);
    this.applyTheme(newTheme);
  }

  /**
   * Sets a specific theme.
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme.set(theme);
    this.applyTheme(theme);
  }

  /**
   * Applies the theme to the DOM and persists to localStorage.
   */
  private applyTheme(theme: 'light' | 'dark'): void {
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.setAttribute('data-theme', 'dark');
    } else {
      htmlElement.removeAttribute('data-theme');
    }
    localStorage.setItem(this.THEME_KEY, theme);
  }
}
