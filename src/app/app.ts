import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CustomizationModeService } from './customization-mode.service';
import { ThemeModeService } from './theme-mode.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly customizationMode = inject(CustomizationModeService);
  private readonly themeMode = inject(ThemeModeService);
  private readonly document = inject(DOCUMENT);

  protected readonly customizationEnabled = this.customizationMode.customizationEnabled;
  protected readonly activeTheme = this.themeMode.activeTheme;

  constructor() {
    effect(() => {
      this.document.body.setAttribute('data-theme', this.activeTheme());
    });
  }

  protected setCustomizationEnabled(enabled: boolean): void {
    this.customizationMode.setCustomizationEnabled(enabled);
  }

  protected setTheme(theme: 'default' | 'corporate' | 'high-contrast'): void {
    this.themeMode.setTheme(theme);
  }
}
