import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  PraxisAiAssistantDockComponent,
  PraxisAiAssistantShellComponent,
} from '@praxisui/ai';
import { SettingsPanelService, openGlobalConfigEditor } from '@praxisui/settings-panel';
import { CustomizationModeService } from './customization-mode.service';
import { QuickstartAiAssistantService } from './quickstart-ai-assistant.service';
import { QuickstartTenantContextService } from './quickstart-tenant-context.service';
import { SiteAnalyticsService } from './site-analytics.service';
import { ThemeModeService } from './theme-mode.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    PraxisAiAssistantDockComponent,
    PraxisAiAssistantShellComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly customizationMode = inject(CustomizationModeService);
  private readonly themeMode = inject(ThemeModeService);
  private readonly document = inject(DOCUMENT);
  private readonly settingsPanel = inject(SettingsPanelService, { optional: true });
  private readonly destroyRef = inject(DestroyRef, { optional: true });
  protected readonly analytics = inject(SiteAnalyticsService);
  protected readonly tenantContext = inject(QuickstartTenantContextService);
  protected readonly aiAssistant = inject(QuickstartAiAssistantService);

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

  protected selectTenant(tenantId: string): void {
    this.tenantContext.selectTenant(tenantId);
  }

  protected openGlobalSettings(): void {
    if (!this.settingsPanel) {
      return;
    }
    openGlobalConfigEditor(this.settingsPanel, {
      title: 'Praxis Platform Global Settings',
      owner: this.destroyRef ?? undefined,
    });
  }
}
