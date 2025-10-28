import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterOutlet, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { Observable, combineLatest } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { DrawerService } from '../drawer/drawer.service';
import { DrawerHostDirective } from '../drawer/drawer-host.directive';
import { GlobalLoadingComponent } from '../loading/global-loading.component';
import { CustomizationModeService } from '../services/customization-mode.service';
import { Highlight } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';
import { TableMetadataBridgeService } from './table-metadata-bridge.service';

type NavItem = { label: string; icon: string; link: string; exact?: boolean };
type NavGroup = { label: string; items: NavItem[] };

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    AsyncPipe,
    NgIf,
    MatSidenavModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    DrawerHostDirective,
    Highlight,
    HighlightLineNumbers,
    GlobalLoadingComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected auth = inject(AuthService);
  private drawer = inject(DrawerService);
  protected custom = inject(CustomizationModeService);
  private http = inject(HttpClient);
  private tableBridge = inject(TableMetadataBridgeService);

  @ViewChild('appAside', { static: true }) aside?: MatSidenav;
  @ViewChild(DrawerHostDirective, { static: true }) drawerHost?: DrawerHostDirective;

  readonly groups: NavGroup[] = [
    {
      label: 'Heróis',
      items: [
        { label: 'Perfis', icon: 'badge', link: '/heroes/perfis' },
        { label: 'Habilidades', icon: 'psychology', link: '/heroes/habilidades' },
        { label: 'Reputações', icon: 'stars', link: '/heroes/reputacoes' },
      ]
    },
    {
      label: 'Operações',
      items: [
        { label: 'Resumo', icon: 'dashboard', link: '/operacoes/resumo' },
        { label: 'Missões', icon: 'flag', link: '/operacoes/missoes' },
        { label: 'Ameaças', icon: 'warning', link: '/operacoes/ameacas' },
      ]
    },
    {
      label: 'Compliance',
      items: [
        { label: 'Indicadores', icon: 'insights', link: '/compliance/indicadores' },
        { label: 'Incidentes', icon: 'report', link: '/compliance/incidentes' },
        { label: 'Indenizações', icon: 'payments', link: '/compliance/indenizacoes' },
      ]
    }
  ];

  isAsideActive$: Observable<boolean> = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    startWith(null),
    map(() => !!this.findOutlet(this.route.root, 'aside')),
  );

  isHome$: Observable<boolean> = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    startWith(null),
    map((e) => {
      const url = (e?.urlAfterRedirects || this.router.url || '').split('?')[0].split('#')[0];
      const first = (url.replace(/^\//, '').split('/')[0] || '').toLowerCase();
      // Atualiza metadados da página e doc do aside
      this.updatePageMeta(url);
      return first === '' || first === 'home';
    })
  );

  asideOpened$ = combineLatest([
    this.isAsideActive$,
    this.drawer.opened$,
  ]).pipe(map(([routeAside, drawerOpen]) => routeAside || drawerOpen));

  ngAfterViewInit(): void {
    if (this.aside && this.drawerHost?.viewContainerRef) {
      this.drawer.register(this.drawerHost.viewContainerRef, this.aside);
    }
  }

  // Page metadata (title/icon/desc) and doc content for the aside
  pageTitle = '';
  pageIcon = 'info';
  pageDesc = '';
  docHtml = '';
  docHtmlApi = '';
  activeDocTab: 'how' | 'api' = 'how';
  isTableDemoRoute = false;
  isFormDemoRoute = false;
  isManualFormDemoRoute = false;
  showTableCode = false;
  tableResourcePath = '';
  formResourcePath = '';
  formMode: 'create' | 'edit' | 'view' = 'create';
  formId = '';
  swaggerUiUrl = 'https://praxis-api-quickstart.onrender.com/swagger-ui/index.html';
  endpointAllUrl = '';
  endpointFilterUrl = '';
  endpointSchemasUrl = '';
  endpointSchemasFilteredUrl = '';
  formEndpointCreateUrl = '';
  formEndpointUpdateUrl = '';
  formEndpointGetByIdUrl = '';
  formEndpointSchemasUrl = '';
  formEndpointSchemasFilteredUrl = '';
  tableConfigJson = '';
  tableConfigHint = 'Aguardando configuração da tabela...';
  formConfigJson = '';
  formConfigHint = 'Aguardando configuração do formulário...';
  schemasRawJson = '';
  schemasRawHint = 'Carregando metadados do servidor...';
  tableDemoUsage = `<!-- No template: informe o caminho do recurso da API e escute metadataChange -->
<praxis-table [resourcePath]="resourcePath" (metadataChange)="onMetadataChanged($event)"></praxis-table>`;
  tableDemoTs = `import { Component } from '@angular/core';
import { PraxisTable } from '@praxisui/table';

@Component({
  selector: 'app-table-demo',
  standalone: true,
  imports: [PraxisTable],
  // Dica: informe o resourcePath e utilize metadataChange para reagir à meta da grade.
  template: '<praxis-table [resourcePath]="resourcePath" (metadataChange)="onMetadataChanged($event)"></praxis-table>',
})
export class TableDemoComponent {
  resourcePath = '/human-resources/funcionarios';
}
`;

  private updatePageMeta(url: string): void {
    const clean = (url || '').split('?')[0].split('#')[0];
    // Defaults
    this.pageTitle = 'Página';
    this.pageIcon = 'description';
    this.pageDesc = '';
    this.docHtml = '';
    this.docHtmlApi = '';
    this.activeDocTab = 'how';
    this.isTableDemoRoute = false;
    this.isFormDemoRoute = false;
    this.isManualFormDemoRoute = false;
    this.showTableCode = false;

    // Route-specific metadata
    if (clean.startsWith('/componentes/table')) {
      this.pageTitle = 'Tabela — Demo';
      this.pageIcon = 'table_view';
      this.pageDesc = 'Tabela inteligente que se configura sozinha a partir da sua API — sem código — com filtros, ordenação e personalização em tempo real.';
      this.isTableDemoRoute = true;
      // Descobre resourcePath a partir do state/history/query
      const fromHist = (history?.state?.['resource'] ?? '').toString().trim();
      const fromQuery = (() => {
        try { return new URL(window.location.href).searchParams.get('resource') || ''; } catch { return ''; }
      })();
      const fallback = '/human-resources/funcionarios';
      const rp = (fromHist || fromQuery || fallback).trim();
      this.tableResourcePath = this.normalizeResourcePath(rp);
      // Constrói links relativos ao host atual (funciona em dev e produção)
      const api = '/api';
      const buildUrls = (rp: string) => {
        this.tableResourcePath = this.normalizeResourcePath(rp);
        this.endpointAllUrl = `${api}${this.tableResourcePath}/all`;
        this.endpointFilterUrl = `${api}${this.tableResourcePath}/filter`;
        this.endpointSchemasUrl = `${api}${this.tableResourcePath}/schemas`;
        const filteredPath = encodeURIComponent(`${api}${this.tableResourcePath}/all`);
        this.endpointSchemasFilteredUrl = `${api}/schemas/filtered?path=${filteredPath}&operation=get&schemaType=response`;
      };
      buildUrls(this.tableResourcePath);
      // Escuta atualizações do TableDemoPage (usa os mesmos metadados já carregados pela tabela)
      this.tableBridge.resourcePath$.subscribe((rp) => rp && buildUrls(rp));
      this.tableBridge.config$.subscribe((cfg) => {
        if (cfg) {
          try { this.tableConfigJson = JSON.stringify(cfg, null, 2); }
          catch { this.tableConfigJson = String(cfg ?? ''); }
        } else {
          this.tableConfigJson = '';
        }
      });
      this.tableBridge.schemasRaw$.subscribe((raw) => {
        if (typeof raw === 'string') this.schemasRawJson = raw;
      });
      this.docHtml = `
        <div class="doc-section">
          <h4 class="section-title">PASSO A PASSO</h4>
          <ul class="checklist">
            <li>
              <span class="step">1</span>
              <div class="step-content">
                <div>Importe o componente:</div>
                <pre><code>imports: [PraxisTable]</code></pre>
              </div>
            </li>
            <li>
              <span class="step">2</span>
              <div class="step-content">
                <div>No template:</div>
                <pre><code>&lt;!-- Informe o resourcePath e escute metadataChange --&gt;\n&lt;praxis-table [resourcePath]=\"resourcePath\" (metadataChange)=\"onMetadataChanged($event)\"&gt;&lt;/praxis-table&gt;</code></pre>
              </div>
            </li>
            <li>
              <span class="step">3</span>
              <div class="step-content">
                <div>No TS:</div>
                <pre><code>resourcePath = '${this.tableResourcePath}';</code></pre>
              </div>
            </li>
          </ul>
          <p class="tip">
            <span class="inline-icon-chip"><span class="material-symbols-outlined" aria-hidden="true">code</span><span> Ver código</span></span> no título exibe os exemplos completos.
          </p>
          <p class="chip"><span class="k">resourcePath</span><span class="v">${this.tableResourcePath}</span></p>
        </div>

        <div class="doc-section">
          <h4 class="section-title">Contrato esperado (endpoints)</h4>
          <div class="info-cards">
            <div class="info-card left-border">
              <div class="heading"><span class="http-badge get">GET</span> <span>Dados</span> <small>coleção para a grade</small></div>
              <p><code>${this.endpointAllUrl}</code></p>
            </div>
            <div class="info-card left-border">
              <div class="heading"><span class="http-badge post">POST</span> <span>Filtro</span> <small>consulta avançada</small></div>
              <p><code>${this.endpointFilterUrl}</code></p>
            </div>
            <div class="info-card left-border">
              <div class="heading"><span class="http-badge get">GET</span> <span>Schemas</span> <small>metadados da grade</small></div>
              <p><code>${this.endpointSchemasUrl}</code></p>
            </div>
            <div class="info-card left-border">
              <div class="heading"><span class="http-badge get">GET</span> <span>Schemas filtrados</span> <small>aplicado ao endpoint de dados</small></div>
              <p><code>${this.endpointSchemasFilteredUrl}</code></p>
            </div>
          </div>
        </div>

        <div class="doc-section">
          <h4 class="section-title">Como a UI se monta</h4>
          <ol>
            <li><span class="k">Descoberta</span>: chama <code>/schemas/filtered</code> com <span class="k">path</span>=<code>${this.endpointAllUrl}</code>, <span class="k">operation</span>=<code>get</code>, <span class="k">schemaType</span>=<code>response</code>.</li>
            <li><span class="k">Normalização</span>: schema + <em>GlobalConfig</em> + preferências do usuário.</li>
            <li><span class="k">Construção</span>: gera colunas (rótulo/tipo/ordem/visibilidade) e toolbar.</li>
            <li><span class="k">Renderização</span>: carrega dados de <code>${this.endpointAllUrl}</code>.</li>
          </ol>
        </div>

        <div class="doc-section">
          <h4 class="section-title">Eventos recomendados</h4>
          <ul>
            <li>
              <code>metadataChange</code> — evento preferido para refletir alterações de metadados (bootstrap/verificação/aplicação).
              <pre><code>&lt;praxis-table [resourcePath]="resourcePath" (metadataChange)="onMetadataChanged($event)"&gt;&lt;/praxis-table&gt;</code></pre>
            </li>
            <li>
              <code>schemaStatusChange</code> — mantido para compatibilidade. Útil para sinalizar <em>outdated</em> e timestamps.
            </li>
          </ul>
        </div>

        <div class="doc-section">
          <h4 class="section-title">Ferramentas visuais</h4>
          <p>Ative o <strong>Modo Edição</strong> para exibir o botão de engrenagem da Tabela. O painel permite ajustar <em>Comportamento</em>, <em>Colunas</em>, <em>Toolbar</em> e <em>Mensagens</em>.</p>
          <p class="muted">Use <strong>Aplicar</strong> para testar sem fechar e <strong>Salvar &amp; Fechar</strong> para persistir.</p>
        </div>

        <div class="doc-section">
          <h4 class="section-title">Links úteis</h4>
          <ul>
            <li><a href="/assets/docs/PraxisUI-Integration-Guide.md" target="_blank" rel="noopener">Guia de Integração — Tokens e Overlays</a></li>
            <li><a href="http://localhost:4003/table-rules" target="_blank" rel="noopener">Table Rules — Index (workspace)</a></li>
            <li><a href="http://localhost:4003/table-rules-simple" target="_blank" rel="noopener">Table Rules — Simple (workspace)</a></li>
            <li><a href="http://localhost:4003/table-rules-complex" target="_blank" rel="noopener">Table Rules — Complex (workspace)</a></li>
          </ul>
        </div>

        <div class="doc-section callout ok">
          <strong>Sem boilerplate</strong> — Basta informar o <span class="k">resourcePath</span>. O contrato governa a UI.
        </div>
      `;
      // Segunda aba: API & Esquema
      this.docHtmlApi = `
        <div class="doc-section">
          <h4 class="section-title">Fluxo de Dados</h4>
          <ul>
            <li>
              <span class="http-badge get" aria-hidden="true">GET</span>
              <strong>Grid</strong>: <code>${this.endpointSchemasUrl}</code>
              <span class="arrow">→</span> <span class="http-badge get">302</span>
              <span class="arrow">→</span> <code>${this.endpointSchemasFilteredUrl}</code>
              <span class="muted"> (UI normaliza campos e monta colunas)</span>
            </li>
            <li>
              <span class="http-badge post" aria-hidden="true">POST</span>
              <strong>Filtro</strong>: <code>${this.endpointFilterUrl}</code>
              <span class="muted">(schema do DTO de filtro; abre em gaveta via FILTER_DRAWER_ADAPTER)</span>
            </li>
          </ul>
        </div>
        <div class="doc-section">
          <h4 class="section-title">Endpoints</h4>
          <ul class="endpoint-list">
            <li><span class="http-badge get">GET</span> <span>Dados:</span> <code>${this.endpointAllUrl}</code></li>
            <li><span class="http-badge post">POST</span> <span>Filtro:</span> <code>${this.endpointFilterUrl}</code></li>
            <li><span class="http-badge get">GET</span> <span>Schemas (grid):</span> <code>${this.endpointSchemasUrl}</code></li>
            <li><span class="http-badge get">GET</span> <span>Schemas filtrados:</span> <code>${this.endpointSchemasFilteredUrl}</code></li>
          </ul>
        </div>
        <div class="doc-section">
          <h4 class="section-title">Parâmetros de /schemas/filtered</h4>
          <pre><code>path=${this.endpointAllUrl}
operation=get
schemaType=response
includeInternalSchemas=false</code></pre>
          <p class="muted">ETag/If-None-Match evita baixar o corpo quando não há mudanças de contrato.</p>
        </div>

        <div class="doc-section">
          <h4 class="section-title">Eventos do componente</h4>
          <ul class="endpoint-list">
            <li><code>metadataChange</code> — recomendado; emite metadados consolidados e motivo: <code>bootstrap</code> | <code>verification</code> | <code>applied</code>.</li>
            <li><code>schemaStatusChange</code> — compatibilidade; emite <code>{ outdated, serverHash?, lastVerifiedAt?, resourcePath? }</code>.</li>
          </ul>
        </div>
      `;
      return;
    }

    // FORM: dynamic form demo
    if (clean.startsWith('/componentes/form')) {
      this.pageTitle = 'Formulário — Demo';
      this.pageIcon = 'dynamic_form';
      this.pageDesc = 'Formulário dinâmico que se monta a partir do contrato OpenAPI, com regras de visibilidade/validação e painel de configurações.';
      this.isFormDemoRoute = true;
      // Estado atual da URL
      const qp = (() => { try { return new URL(window.location.href).searchParams; } catch { return new URLSearchParams(); } })();
      const rp = this.normalizeResourcePath(qp.get('resource') || '/human-resources/funcionarios');
      const mode = (qp.get('mode') || 'create').toLowerCase();
      const id = (qp.get('id') || '').trim();
      const normMode: 'create'|'edit'|'view' = mode==='edit'||mode==='view' ? (mode as any) : 'create';
      this.formResourcePath = rp;
      this.formMode = normMode;
      this.formId = id;

      const api = '/api';
      const buildUrls = (resourcePath: string, m: 'create'|'edit'|'view', i: string) => {
        this.formResourcePath = this.normalizeResourcePath(resourcePath);
        this.formMode = m;
        this.formId = i;
        this.formEndpointCreateUrl = `${api}${this.formResourcePath}`;
        this.formEndpointUpdateUrl = `${api}${this.formResourcePath}/${encodeURIComponent(i || '1')}`;
        this.formEndpointGetByIdUrl = `${api}${this.formResourcePath}/${encodeURIComponent(i || '1')}`;
        this.formEndpointSchemasUrl = `${api}${this.formResourcePath}/schemas`;
        // schemas/filtered coerente com o modo
        const op = m === 'create' ? 'post' : (m === 'edit' ? 'put' : 'get');
        const schemaType = m === 'view' ? 'response' : 'request';
        const path = m === 'create'
          ? `${api}${this.formResourcePath}`
          : `${api}${this.formResourcePath}/${encodeURIComponent(i || '1')}`;
        const filteredPath = encodeURIComponent(path);
        this.formEndpointSchemasFilteredUrl = `${api}/schemas/filtered?path=${filteredPath}&operation=${op}&schemaType=${schemaType}`;
      };
      buildUrls(rp, normMode, id);
      // Escutar updates do bridge compartilhado (mesmo usado pela tabela)
      this.tableBridge.resourcePath$.subscribe((nrp) => nrp && buildUrls(nrp, this.formMode, this.formId));
      this.tableBridge.config$.subscribe((cfg) => {
        if (cfg) {
          try { this.formConfigJson = JSON.stringify(cfg, null, 2); }
          catch { this.formConfigJson = String(cfg ?? ''); }
        } else {
          this.formConfigJson = '';
        }
      });
      this.tableBridge.schemasRaw$.subscribe((raw) => {
        if (typeof raw === 'string') this.schemasRawJson = raw;
      });

      this.docHtml = `
        <div class=\"doc-section\">
          <h4 class=\"section-title\">PASSO A PASSO</h4>
          <ul class=\"checklist\">
            <li>
              <span class=\"step\">1</span>
              <div class=\"step-content\">
                <div>Importe o componente:</div>
                <pre><code>imports: [PraxisDynamicForm]</code></pre>
              </div>
            </li>
            <li>
              <span class=\"step\">2</span>
              <div class=\"step-content\">
                <div>No template:</div>
                <pre><code>&lt;praxis-dynamic-form [resourcePath]=\"resourcePath\" [resourceId]=\"resourceId\" [mode]=\"mode\" [editModeEnabled]=\"true\"&gt;&lt;/praxis-dynamic-form&gt;</code></pre>
              </div>
            </li>
            <li>
              <span class=\"step\">3</span>
              <div class=\"step-content\">
                <div>No TS:</div>
                <pre><code>resourcePath = '${this.formResourcePath}';\nmode = '${this.formMode}';\nresourceId = '${this.formId || ''}';</code></pre>
              </div>
            </li>
          </ul>
          <p class=\"chip\"><span class=\"k\">resourcePath</span><span class=\"v\">${this.formResourcePath}</span></p>
          <p class=\"chip\"><span class=\"k\">mode</span><span class=\"v\">${this.formMode}</span></p>
          ${this.formMode !== 'create' ? `<p class=\"chip\"><span class=\"k\">id</span><span class=\"v\">${this.formId || '1'}</span></p>` : ''}
        </div>

        <div class=\"doc-section\">
          <h4 class=\"section-title\">Contrato esperado (endpoints)</h4>
          <div class=\"info-cards\">
            <div class=\"info-card left-border\">
              <div class=\"heading\"><span class=\"http-badge post\">POST</span> <span>Criar</span> <small>novo registro</small></div>
              <p><code>${this.formEndpointCreateUrl}</code></p>
            </div>
            <div class=\"info-card left-border\">
              <div class=\"heading\"><span class=\"http-badge put\">PUT</span> <span>Atualizar</span> <small>registro existente</small></div>
              <p><code>${this.formEndpointUpdateUrl}</code></p>
            </div>
            <div class=\"info-card left-border\">
              <div class=\"heading\"><span class=\"http-badge get\">GET</span> <span>Carregar</span> <small>registro por ID</small></div>
              <p><code>${this.formEndpointGetByIdUrl}</code></p>
            </div>
            <div class=\"info-card left-border\">
              <div class=\"heading\"><span class=\"http-badge get\">GET</span> <span>Schemas</span> <small>metadados do formulário</small></div>
              <p><code>${this.formEndpointSchemasUrl}</code></p>
            </div>
            <div class=\"info-card left-border\">
              <div class=\"heading\"><span class=\"http-badge get\">GET</span> <span>Schemas filtrados</span> <small>coerentes com o modo</small></div>
              <p><code>${this.formEndpointSchemasFilteredUrl}</code></p>
            </div>
          </div>
        </div>

        <div class=\"doc-section\">
          <h4 class=\"section-title\">Como a UI se monta</h4>
          <ol>
            <li><span class=\"k\">Descoberta</span>: chama <code>/schemas/filtered</code> com <span class=\"k\">path</span>=<code>${this.formMode==='create'?this.formEndpointCreateUrl:this.formEndpointGetByIdUrl}</code>, <span class=\"k\">operation</span>=<code>${this.formMode==='create'?'post':this.formMode==='edit'?'put':'get'}</code>, <span class=\"k\">schemaType</span>=<code>${this.formMode==='view'?'response':'request'}</code>.</li>
            <li><span class=\"k\">Normalização</span>: schema + <em>GlobalConfig</em> + preferências do usuário.</li>
            <li><span class=\"k\">Construção</span>: gera campos (rótulo/tipo/ordem/visibilidade) e ações.</li>
            <li><span class=\"k\">Validação/Salvar</span>: aplica regras, envia <code>${this.formMode==='create'?'POST':'PUT'}</code> ou somente leitura no modo <code>view</code>.</li>
          </ol>
        </div>

        <div class=\"doc-section\">
          <h4 class=\"section-title\">Ferramentas visuais</h4>
          <p>Ative o <strong>Modo Edição</strong> para exibir o painel de configurações do Form. Ajuste comportamento, layout e mensagens em tempo real.</p>
        </div>

        <div class=\"doc-section callout ok\">
          <strong>Sem boilerplate</strong> — Informe <span class=\"k\">resourcePath</span>, <span class=\"k\">mode</span> e, quando necessário, <span class=\"k\">id</span>. O contrato governa a UI.
        </div>
      `;

      this.docHtmlApi = `
        <div class=\"doc-section\">
          <h4 class=\"section-title\">Fluxo de Dados</h4>
          <ul>
            <li>
              <span class=\"http-badge get\" aria-hidden=\"true\">GET</span>
              <strong>Schemas</strong>: <code>${this.formEndpointSchemasUrl}</code>
              <span class=\"arrow\">→</span> <span class=\"http-badge get\">302</span>
              <span class=\"arrow\">→</span> <code>${this.formEndpointSchemasFilteredUrl}</code>
              <span class=\"muted\"> (UI normaliza campos e monta o formulário)</span>
            </li>
            <li>
              <span class=\"http-badge ${this.formMode==='create'?'post':this.formMode==='edit'?'put':'get'}\" aria-hidden=\"true\">${this.formMode==='create'?'POST':this.formMode==='edit'?'PUT':'GET'}</span>
              <strong>${this.formMode==='view'?'Carregar':'Salvar'}</strong>:
              <code>${this.formMode==='create'?this.formEndpointCreateUrl:this.formMode==='edit'?this.formEndpointUpdateUrl:this.formEndpointGetByIdUrl}</code>
            </li>
          </ul>
        </div>
      `;
      return;
    }

    // FORM MANUAL: list + manual form demo
    if (clean.startsWith('/componentes/form-manual')) {
      this.pageTitle = 'Formulário Manual — Demo';
      this.pageIcon = 'fact_check';
      this.pageDesc = 'Lista remota (VW_PERFIL_HEROI) no topo e formulário manual editando o Funcionário real, com validações e selects remotos.';
      this.isManualFormDemoRoute = true;

      const api = '/api';
      const listUrl = `${api}/human-resources/vw-perfil-heroi/all`;
      const getByIdUrl = `${api}/human-resources/funcionarios/{id}`;
      const cargosUrl = `${api}/human-resources/cargos/options/filter`;
      const deptosUrl = `${api}/human-resources/departamentos/options/filter`;

      // Doc principal
      this.docHtml = `
        <div class="doc-section">
          <h4 class="section-title">PASSO A PASSO</h4>
          <ol>
            <li>Importe <code>PraxisList</code> e <code>ManualFormComponent</code>.</li>
            <li>No topo, renderize <code>&lt;praxis-list&gt;</code> com <code>resourcePath='/human-resources/vw-perfil-heroi'</code> e seleção <em>single</em>.</li>
            <li>Ao selecionar, extraia <code>id = funcionarioId ?? id</code> e carregue o Funcionário real.</li>
            <li>Use <code>&lt;praxis-manual-form [formGroup]&gt;</code> com campos <code>pdx-*</code> autodetectados.</li>
            <li>Para combos remotos, carregue opções e aplique via <code>manualForm.instance.patchFieldMetadata()</code>.</li>
            <li>Salvar com <code>GenericCrudService.update(id, payload)</code>.</li>
          </ol>
        </div>

        <div class="doc-section">
          <h4 class="section-title">Template (trecho)</h4>
          <pre><code class="language-xml">&lt;praxis-list [config]=\"listConfig\" (selectionChange)=\"onSelection($event)\"&gt;&lt;/praxis-list&gt;\n\n&lt;form [formGroup]=\"form\" (ngSubmit)=\"onSubmit()\"&gt;\n  &lt;praxis-manual-form [formGroup]=\"form\" formId=\"funcionario-manual\" [editModeEnabled]=\"custom.enabled()\"&gt;\n    &lt;pdx-text-input formControlName=\"nomeCompleto\" label=\"Nome completo\"&gt;&lt;/pdx-text-input&gt;\n    &lt;pdx-material-datepicker formControlName=\"dataNascimento\" label=\"Data de nascimento\"&gt;&lt;/pdx-material-datepicker&gt;\n    &lt;pdx-material-currency formControlName=\"salario\" [metadata]=\"currencyMeta\"&gt;&lt;/pdx-material-currency&gt;\n    &lt;pdx-material-select formControlName=\"cargoId\" label=\"Cargo\"&gt;&lt;/pdx-material-select&gt;\n  &lt;/praxis-manual-form&gt;\n  &lt;button type=\"submit\"&gt;Salvar&lt;/button&gt;\n&lt;/form&gt;</code></pre>
        </div>

        <div class="doc-section">
          <h4 class="section-title">TypeScript (trecho)</h4>
          <pre><code class="language-typescript">onSelection(ev: any) {\n  const id = Number(ev?.ids?.[0] ?? ev?.items?.[0]?.funcionarioId ?? ev?.items?.[0]?.id);\n  if (!id) return;\n  crud.configure('/human-resources/funcionarios');\n  crud.getById(id).subscribe(x =&gt; form.patchValue(FuncionarioAdapter.toForm(x)));\n}\n\nfunction patchSelectOptions(field: string, opts: Array&lt;{ id: any; label: string }&gt;) {\n  const selectOptions = opts.map(o =&gt; ({ value: o.id, text: o.label }));\n  manualForm.instance?.patchFieldMetadata(field, { controlType: FieldControlType.SELECT, selectOptions });\n}\n\nfunction onSubmit() {\n  const payload = FuncionarioAdapter.toPayload(form.value);\n  crud.configure('/human-resources/funcionarios');\n  crud.update(selectedId, payload).subscribe();\n}</code></pre>
        </div>

        <div class="doc-section">
          <h4 class="section-title">Dicas de UX</h4>
          <ul>
            <li><strong>Loading</strong>: desabilite o botão Salvar enquanto envia.</li>
            <li><strong>Validações</strong>: use <code>mat-error</code> dos campos e helpers como <code>cpfValidator</code> e <code>pastDateValidator</code>.</li>
            <li><strong>Editor</strong>: duplo clique abre editor quando o <em>Modo Edição</em> está ativo.</li>
          </ul>
        </div>
      `;

      // API & Esquema
      this.docHtmlApi = `
        <div class=\"doc-section\">
          <h4 class=\"section-title\">Endpoints</h4>
          <ul class=\"endpoint-list\">
            <li><span class=\"http-badge get\">GET</span> Lista: <code>${listUrl}</code></li>
            <li><span class=\"http-badge get\">GET</span> Detalhe: <code>${getByIdUrl}</code></li>
            <li><span class=\"http-badge post\">POST</span> Cargos (options): <code>${cargosUrl}</code></li>
            <li><span class=\"http-badge post\">POST</span> Departamentos (options): <code>${deptosUrl}</code></li>
          </ul>
        </div>
      `;
      return;
    }

    // Fallbacks por seção
    const seg = clean.replace(/^\//, '').split('/')[0] || 'home';
    switch (seg) {
      case 'operacoes':
        this.pageTitle = 'Operações';
        this.pageIcon = 'dashboard';
        this.pageDesc = 'Resumo, Missões e Ameaças.';
        break;
      case 'heroes':
        this.pageTitle = 'Heróis';
        this.pageIcon = 'stars';
        this.pageDesc = 'Perfis, Habilidades e Reputações.';
        break;
      case 'compliance':
        this.pageTitle = 'Compliance';
        this.pageIcon = 'insights';
        this.pageDesc = 'Indicadores, Incidentes e Indenizações.';
        break;
      case 'componentes':
        this.pageTitle = 'Componentes';
        this.pageIcon = 'widgets';
        this.pageDesc = 'Showcases de componentes do Praxis UI.';
        break;
      case 'ferramentas':
        this.pageTitle = 'Ferramentas';
        this.pageIcon = 'construction';
        this.pageDesc = 'Editores e utilitários para acelerar a configuração.';
        break;
      default:
        this.pageTitle = 'Página';
        this.pageIcon = 'description';
        this.pageDesc = '';
    }
  }

  private findOutlet(route: ActivatedRoute, outlet: string): ActivatedRoute | null {
    for (const child of route.children) {
      if ((child as any).outlet === outlet) {
        return child;
      }
      const nested = this.findOutlet(child, outlet);
      if (nested) return nested;
    }
    return null;
  }

  onAsideClosed() {
    // Fecha rota auxiliar e limpa conteúdo do drawer programático
    this.drawer.detach();
    this.router.navigate([{ outlets: { aside: null } }], { relativeTo: this.route.root });
  }

  onLogout() {
    this.auth.logout().subscribe(() => {
      this.router.navigateByUrl('/login');
    });
  }

  toggleTableCode() {
    this.showTableCode = !this.showTableCode;
  }

  reloadTableMetadata() {
    this.schemasRawHint = 'Carregando metadados do servidor...';
    const url = this.endpointSchemasFilteredUrl;
    if (!url) { this.schemasRawJson = ''; return; }
    this.http.get(url).subscribe({
      next: (data) => {
        try { this.schemasRawJson = JSON.stringify(data, null, 2); }
        catch { this.schemasRawJson = String(data ?? ''); }
      },
      error: (err) => {
        this.schemasRawJson = '';
        this.schemasRawHint = 'Falha ao carregar metadados. Verifique CORS/endpoint e tente novamente.';
        // eslint-disable-next-line no-console
        console.warn('Metadata fetch error', err);
      }
    });
  }

  reloadFormMetadata() {
    this.schemasRawHint = 'Carregando metadados do servidor...';
    const url = this.formEndpointSchemasFilteredUrl;
    if (!url) { this.schemasRawJson = ''; return; }
    this.http.get(url).subscribe({
      next: (data) => {
        try { this.schemasRawJson = JSON.stringify(data, null, 2); }
        catch { this.schemasRawJson = String(data ?? ''); }
      },
      error: (err) => {
        this.schemasRawJson = '';
        this.schemasRawHint = 'Falha ao carregar metadados. Verifique CORS/endpoint e tente novamente.';
        // eslint-disable-next-line no-console
        console.warn('Metadata fetch error', err);
      }
    });
  }

  private normalizeResourcePath(input: string): string {
    let p = (input || '').trim();
    if (!p.startsWith('/')) p = '/' + p;
    return p.replace(/\/$/, '');
  }
}
