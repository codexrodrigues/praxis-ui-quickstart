import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { SettingsPanelService, GlobalConfigEditorComponent } from '@praxisui/settings-panel';

type TabItem = { label: string; link?: string; external?: boolean };

@Component({
  selector: 'app-primary-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './primary-nav.component.html',
  styleUrls: ['./primary-nav.component.scss']
})
export class PrimaryNavComponent {
  protected readonly tabs: TabItem[] = [
    { label: 'Início', link: '/home' },
    { label: 'Operações', link: '/operacoes/resumo' },
    { label: 'Heróis', link: '/heroes/perfis' },
    { label: 'Compliance', link: '/compliance/indicadores' },
    { label: 'Componentes', link: '/componentes' },
    { label: 'Ferramentas', link: '/ferramentas' },
    { label: 'Docs', link: 'https://praxis-api-quickstart.onrender.com/swagger-ui/index.html', external: true },
  ];

  private auth = inject(AuthService);
  private router = inject(Router);
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
