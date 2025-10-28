import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PraxisTabs, type TabsMetadata } from '@praxisui/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomizationModeService } from '../../core/services/customization-mode.service';

@Component({
  selector: 'app-tabs-demo-page',
  standalone: true,
  imports: [CommonModule, PraxisTabs, MatTooltipModule],
  template: `
    <section class="didactic-card gradient-border" aria-label="Abas configuráveis">
      <div class="card-body">
        <h3 class="title">Praxis Tabs — demo
          <span class="hint-icon material-symbols-outlined"
                matTooltip="Ative 'Ativar edição' no topo e clique no ícone de configurações para abrir o editor de Tabs. Você pode adicionar/remover abas, inserir widgets (Tabela/Form), configurar alinhamento, tema e lazy load."
                matTooltipPosition="below" aria-label="Ajuda">help</span>
        </h3>
        <p class="subtitle">Exemplo com duas abas: Tabela e Formulário dinâmico, montadas por metadados.</p>
      </div>
    </section>

    <praxis-tabs [config]="tabsCfg" [tabsId]="'tabs-demo'" [editModeEnabled]="custom.enabled()" (widgetEvent)="onWidgetEvent($event)"></praxis-tabs>

    <section class="didactic-card gradient-border" aria-label="Abas (modo nav)">
      <div class="card-body">
        <h3 class="title">Praxis Tabs — nav mode
          <span class="hint-icon material-symbols-outlined"
                matTooltip="No modo nav, configure links (rótulos) e defina conteúdo/widget por link. No editor, altere cor, comportamento e ordem dos links, além de inserir novos widgets."
                matTooltipPosition="below" aria-label="Ajuda">help</span>
        </h3>
        <p class="subtitle">Demonstra navegação com links e conteúdos diferentes por link.</p>
      </div>
    </section>

    <praxis-tabs [config]="tabsNavCfg" [tabsId]="'tabs-nav-demo'" [editModeEnabled]="custom.enabled()" (widgetEvent)="onWidgetEvent($event)"></praxis-tabs>
  `,
  styles: [`
    :host { display:block; }
    .didactic-card { margin-bottom: 10px; border-radius: 10px; }
    .didactic-card .card-body { padding: 12px; background: rgba(255,255,255,0.03); border-radius: 10px; }
    .title { margin: 0 0 6px; font-size: 18px; font-weight: 800; letter-spacing: .2px; color: var(--text-strong); }
    .subtitle { margin: 0; color: var(--text-muted); }
    .hint-icon { margin-left: 6px; font-size: 18px; vertical-align: middle; color: var(--brand-grad-end, #8b5cf6); cursor: help; }
  `]
})
export class TabsDemoPage {
  protected custom = inject(CustomizationModeService);

  tabsCfg: TabsMetadata = {
    appearance: {
      density: 'comfortable',
      tokens: {
        'active-indicator-color': 'var(--brand-grad-end, #8b5cf6)',
      } as any,
    },
    behavior: { lazyLoad: true },
    group: { alignTabs: 'start', selectedIndex: 0, color: 'primary' },
    tabs: [
      {
        id: 'tab-table',
        textLabel: 'Tabela',
        widgets: [
          { id: 'praxis-table', inputs: { resourcePath: '/human-resources/funcionarios' } },
        ],
      },
      {
        id: 'tab-form',
        textLabel: 'Formulário',
        widgets: [
          { id: 'praxis-dynamic-form', inputs: { resourcePath: '/human-resources/funcionarios', mode: 'create' } },
        ],
      },
      {
        id: 'tab-list',
        textLabel: 'Lista',
        widgets: [
          {
            id: 'praxis-list',
            inputs: {
              config: {
                id: 'tab-list-demo',
                dataSource: { resourcePath: '/human-resources/vw-perfil-heroi', sort: ['scoreMedio,desc'] },
                layout: { variant: 'list', lines: 2 },
                templating: {
                  primary: { type: 'text', expr: '${item.codinome || item.nomeCompleto}' },
                  secondary: { type: 'text', expr: 'Depto: ${item.departamento} • Cargo: ${item.cargo}' },
                },
              }
            }
          }
        ]
      },
    ],
  };

  tabsNavCfg: TabsMetadata = {
    appearance: {
      density: 'comfortable',
      tokens: {
        'active-indicator-color': 'var(--brand-grad-start, #60a5fa)',
      } as any,
    },
    behavior: { lazyLoad: true },
    nav: {
      selectedIndex: 0,
      color: 'accent',
      links: [
        {
          id: 'link-dados',
          label: 'Dados',
          widgets: [
            { id: 'praxis-table', inputs: { resourcePath: '/human-resources/indenizacoes' } },
          ],
        },
        {
          id: 'link-lista',
          label: 'Lista',
          widgets: [
            {
              id: 'praxis-list',
              inputs: {
                config: {
                  id: 'nav-list-demo',
                  dataSource: { resourcePath: '/human-resources/vw-ranking-reputacao', sort: ['posicao,asc'] },
                  layout: { variant: 'cards', lines: 2 },
                  templating: {
                    primary: { type: 'text', expr: '${item.codinome || item.nomeCompleto}' },
                    secondary: { type: 'text', expr: 'Equipe: ${item.equipe}' },
                  },
                }
              }
            }
          ],
        },
        {
          id: 'link-form',
          label: 'Formulário',
          widgets: [
            { id: 'praxis-dynamic-form', inputs: { resourcePath: '/human-resources/incidentes', mode: 'create' } },
          ],
        },
      ],
    },
  };

  onWidgetEvent(ev: any): void {
    // ponte para depuração ou futuras conexões (ex.: abrir form a partir da seleção da tabela)
    try { console.debug('[TabsDemo] widgetEvent', ev); } catch {}
  }
}
