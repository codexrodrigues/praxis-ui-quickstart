import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'praxis-ui-quickstart.customization-mode';

@Injectable({ providedIn: 'root' })
export class CustomizationModeService {
  private readonly customizationEnabledState = signal(this.readInitialValue());

  readonly customizationEnabled = this.customizationEnabledState.asReadonly();

  setCustomizationEnabled(enabled: boolean): void {
    this.customizationEnabledState.set(enabled);
    this.writeValue(enabled);
  }

  toggle(): void {
    this.setCustomizationEnabled(!this.customizationEnabledState());
  }

  private readInitialValue(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) !== 'false';
    } catch {
      return true;
    }
  }

  private writeValue(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      // Ignore storage failures and keep the in-memory toggle working.
    }
  }
}
