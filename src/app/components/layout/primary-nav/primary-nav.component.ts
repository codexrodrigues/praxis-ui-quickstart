import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
// removed unused AuthService/Router (public navigation)
import { SettingsPanelService, GlobalConfigEditorComponent } from '@praxisui/settings-panel';

type TabItem = { label: string; link?: string; external?: boolean };

@Component({
  selector: 'app-primary-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgFor, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './primary-nav.component.html',
  styleUrls: ['./primary-nav.component.scss']
})
export class PrimaryNavComponent {
  protected readonly tabs: TabItem[] = [
    { label: 'Início', link: '/home' },
    { label: 'Componentes', link: '/componentes' },
    { label: 'Formulários', link: '/componentes/form' },
    { label: 'Tabelas', link: '/componentes/table' },
    { label: 'Docs', link: 'https://praxis-api-quickstart.onrender.com/swagger-ui/index.html', external: true },
  ];

  private settings = inject(SettingsPanelService);

  openGlobalConfig(): void {
    try {
      this.settings.open({
        id: 'global-config',
        title: 'Configurações Globais',
        titleIcon: 'tune',
        content: { component: GlobalConfigEditorComponent, inputs: {} },
      });
    } catch (e) {
      console.warn('Global Config editor indisponível:', e);
    }
  }
}
