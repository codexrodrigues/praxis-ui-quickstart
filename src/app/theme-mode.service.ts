import { Injectable, signal } from '@angular/core';

export type HostTheme = 'default' | 'corporate' | 'high-contrast';

const STORAGE_KEY = 'praxis-ui-quickstart.host-theme';

@Injectable({ providedIn: 'root' })
export class ThemeModeService {
  private readonly activeThemeState = signal<HostTheme>(this.readInitialTheme());

  readonly activeTheme = this.activeThemeState.asReadonly();

  setTheme(theme: HostTheme): void {
    this.activeThemeState.set(theme);
    this.writeTheme(theme);
  }

  private readInitialTheme(): HostTheme {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'default' || stored === 'corporate' || stored === 'high-contrast') {
        return stored;
      }
    } catch {
      // Ignore storage failures and keep the in-memory theme working.
    }

    return 'default';
  }

  private writeTheme(theme: HostTheme): void {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures and keep the in-memory theme working.
    }
  }
}
