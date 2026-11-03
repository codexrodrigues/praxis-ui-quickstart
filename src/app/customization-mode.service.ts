import { Injectable, inject, signal } from '@angular/core';
import { PraxisCustomizationModeService } from '@praxisui/core';

const STORAGE_KEY = 'praxis-ui-quickstart.customization-mode';

@Injectable({ providedIn: 'root' })
export class CustomizationModeService {
  private readonly praxisCustomization = inject(PraxisCustomizationModeService, {
    optional: true,
  });
  private readonly customizationEnabledState = signal(this.readInitialValue());

  readonly customizationEnabled = this.customizationEnabledState.asReadonly();

  constructor() {
    this.praxisCustomization?.setCustomizing(this.customizationEnabledState());
  }

  setCustomizationEnabled(enabled: boolean): void {
    this.customizationEnabledState.set(enabled);
    this.praxisCustomization?.setCustomizing(enabled);
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
