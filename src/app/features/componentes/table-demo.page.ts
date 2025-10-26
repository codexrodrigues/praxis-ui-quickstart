import { Component, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { PraxisTable } from '@praxisui/table';
import { CustomizationModeService } from '../../core/services/customization-mode.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TableMetadataBridgeService } from '../../core/layout/table-metadata-bridge.service';

@Component({
  selector: 'app-table-demo-page',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatButtonModule, PraxisTable],
  template: `
    <section class="didactic-card gradient-border" aria-label="Explorar endpoints">
      <div class="card-body">
        <div class="card-left">
          <h3 class="title">Explore diferentes recursos</h3>
          <p class="subtitle">Altere o <strong>resourcePath</strong> para ver a tabela se adaptar automaticamente.</p>
          <div class="quick-options" role="group" aria-label="Atalhos de recursos">
            <button type="button" class="chip" (click)="applyResource('/human-resources/funcionarios')">
              <span class="material-symbols-outlined" aria-hidden="true">group</span>
              <span>Funcionários</span>
            </button>
            <button type="button" class="chip" (click)="applyResource('/compliance/incidentes')">
              <span class="material-symbols-outlined" aria-hidden="true">report</span>
              <span>Incidentes</span>
            </button>
            <button type="button" class="chip" (click)="applyResource('/compliance/indenizacoes')">
              <span class="material-symbols-outlined" aria-hidden="true">payments</span>
              <span>Indenizações</span>
            </button>
          </div>
        </div>
        <form class="card-right" (submit)="onApplyCustom($event)" aria-label="Definir resourcePath manualmente">
          <label for="resourceInput" class="label">resourcePath atual</label>
          <div class="input-row">
            <input id="resourceInput" class="text" type="text" [value]="resourcePath" (input)="resourceInput = ( $any($event.target).value || '' )" placeholder="/modulo/recurso" spellcheck="false" />
            <button type="submit" class="apply">Carregar</button>
          </div>
          <small class="hint">Dica: você pode colar qualquer caminho da sua API (ex.: <code>/human-resources/funcionarios</code>).</small>

          <div class="or">ou</div>

          <mat-form-field appearance="fill" class="select-field">
            <mat-label>Escolher um recurso</mat-label>
            <mat-select [(value)]="selectedResource" panelClass="resource-select-panel">
              <mat-option disabled class="search-option">
                <div class="search-row" (click)="$event.stopPropagation()">
                  <span class="material-symbols-outlined" aria-hidden="true">search</span>
                  <input type="text" [value]="searchTerm" (input)="onFilter($event)" placeholder="Buscar por nome…" />
                  <button type="button" class="clear" *ngIf="searchTerm" (click)="clearFilter(); $event.stopPropagation();">Limpar</button>
                </div>
              </mat-option>
              <ng-container *ngFor="let r of viewResources">
                <mat-option [value]="r">
                  <div class="opt">
                    <span class="material-symbols-outlined" aria-hidden="true">{{ r.icon || 'table_view' }}</span>
                    <div class="opt-text">
                      <div class="opt-title">{{ r.title }}</div>
                      <div class="opt-desc">{{ r.description }}</div>
                    </div>
                  </div>
                </mat-option>
              </ng-container>
              <ng-template matSelectTrigger>
                <span *ngIf="selectedResource; else placeholder">{{ selectedResource.title }}</span>
                <ng-template #placeholder>Selecione um recurso…</ng-template>
              </ng-template>
            </mat-select>
          </mat-form-field>
          <button type="button" class="apply" (click)="selectedResource && applyResource(selectedResource.path)">Aplicar seleção</button>
          <small class="hint">O caminho real (resourcePath) é aplicado somente ao confirmar.</small>
        </form>
      </div>
      
    </section>

    <praxis-table
      [resourcePath]="resourcePath"
      (schemaStatusChange)="onSchemaStatus()"
    ></praxis-table>
  `,
  styles: [`
    :host { display: block; }
    .didactic-card { margin-bottom: 10px; border-radius: 10px; }
    .didactic-card .card-body { display: grid; grid-template-columns: 1fr; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 10px; }
    @media (min-width: 1024px) {
      .didactic-card .card-body { grid-template-columns: 1.3fr 1fr; }
    }
    .didactic-card .title { margin: 0 0 4px; font-size: 16px; font-weight: 800; letter-spacing: .2px; color: var(--text-strong); }
    .didactic-card .subtitle { margin: 0 0 8px; color: var(--text-muted); }
    .quick-options { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.06); color: var(--text-body); cursor: pointer; }
    .chip:hover { filter: brightness(1.05); }
    .chip .material-symbols-outlined { font-size: 16px; line-height: 1; }
    .card-right .label { display: inline-block; font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
    .input-row { display: grid; grid-template-columns: 1fr auto; gap: 8px; }
    .text { width: 100%; height: 32px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.18); background: rgba(0,0,0,0.2); color: #eaeaf1; padding: 0 8px; }
    .apply { height: 32px; padding: 0 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.18); background-image: linear-gradient(90deg, var(--brand-grad-start), var(--brand-grad-end)); color: #fff; font-weight: 700; letter-spacing: .2px; cursor: pointer; }
    .hint { color: var(--text-muted); }
    .or { text-align: center; color: var(--text-subtle); font-size: 12px; margin: 6px 0; }
    .select-field { width: 100%; }
    .opt { display: grid; grid-template-columns: auto 1fr; gap: 8px; align-items: start; }
    .opt .material-symbols-outlined { font-size: 18px; line-height: 1; color: var(--brand-grad-end); }
    .opt-text { min-width: 0; }
    .opt-title { font-weight: 700; color: var(--text-strong); }
    .opt-desc { color: var(--text-muted); font-size: 12.5px; white-space: normal; }

    /* (Grade de cards removida — seletor mat-select substitui a listagem) */

    /* Select panel (overlay) styles */
    :host ::ng-deep .resource-select-panel .mat-mdc-select-panel { padding-top: 0; }
    :host ::ng-deep .resource-select-panel .search-option { position: sticky; top: 0; z-index: 2; background: var(--md-sys-color-surface); }
    :host ::ng-deep .resource-select-panel .search-row { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 6px; padding: 8px 10px; border-bottom: 1px solid var(--md-sys-color-outline-variant); }
    :host ::ng-deep .resource-select-panel .search-row .material-symbols-outlined { font-size: 18px; color: var(--brand-grad-end); }
    :host ::ng-deep .resource-select-panel .search-row input { height: 28px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.06); color: var(--text-body); padding: 0 8px; width: 100%; }
    :host ::ng-deep .resource-select-panel .search-row .clear { height: 28px; padding: 0 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.06); color: var(--text-body); cursor: pointer; }
  `]
})
export class TableDemoPage implements AfterViewInit {
  // Conecta ao recurso definido pela rota (?resource=/...)
  resourcePath = '/human-resources/funcionarios';
  private readonly storageKey = 'table-demo:lastResource';
  private hasExternalResource = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected custom = inject(CustomizationModeService);
  private bridge = inject(TableMetadataBridgeService);
  private http = inject(HttpClient);

  @ViewChild(PraxisTable) private table?: any;
  protected resourceInput = '';
  selectedResource: { path: string; title: string; description: string; icon?: string } | null = null;
  searchTerm = '';

  constructor() {
    // 1) Prefer estado de navegação (não aparece na URL)
    const fromNav = this.router.getCurrentNavigation()?.extras?.state?.['resource'];
    if (typeof fromNav === 'string' && fromNav.trim()) {
      this.resourcePath = fromNav.trim();
      this.hasExternalResource = true;
    }
    // 2) Fallback: estado do histórico (em reload)
    const fromHist = (history?.state?.['resource'] ?? '').toString().trim();
    if (fromHist) { this.resourcePath = fromHist; this.hasExternalResource = true; }

    // 3) Fallback: query param (visível)
    this.route.queryParamMap.subscribe((q) => {
      const res = (q.get('resource') || '').trim();
      if (res) { this.resourcePath = res; this.hasExternalResource = true; }
    });
    const fromParam = (this.route.snapshot.queryParamMap.get('resource') || '').trim();
    if (fromParam) { this.resourcePath = fromParam; this.hasExternalResource = true; }

    // 4) Última escolha (localStorage), apenas se nada veio da navegação/URL
    if (!this.hasExternalResource) {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved && typeof saved === 'string') {
          this.resourcePath = this.normalize(saved);
        }
      } catch {}
    }
  }

  ngAfterViewInit(): void {
    // Tenta empurrar metadados assim que a tabela inicializar
    setTimeout(() => this.pushMetadata(), 0);
    // Carrega lista de recursos (30 principais)
    this.loadResources();
  }

  onSchemaStatus(): void { this.pushMetadata(); }

  private pushMetadata(): void {
    try {
      const cfg = this.table?.config ?? null;
      const rp = this.table?.resourcePath ?? this.resourcePath;
      this.bridge.setResourcePath(rp);
      if (cfg) this.bridge.setConfig(cfg);
      // Tenta obter o schema bruto do cache do GenericCrudService para evitar nova requisição
      const svc: any = (this.table as any)?.crudService;
      const info = svc?.getLastSchemaInfo?.();
      const cache = svc?._schemaCache;
      if (info?.schemaId && typeof cache?.get === 'function') {
        Promise.resolve(cache.get(info.schemaId))
          .then((entry: any) => {
            const raw = entry?.schema ? JSON.stringify(entry.schema, null, 2) : null;
            this.bridge.setSchemasRaw(raw);
          })
          .catch(() => this.bridge.setSchemasRaw(null));
      }
    } catch {}
  }

  // Resource catalog (top 30)
  resources: { path: string; title: string; description: string; icon?: string }[] = [];
  viewResources: { path: string; title: string; description: string; icon?: string }[] = [];
  private loadResources(): void {
    this.http.get<{ path: string; title: string; description: string; icon?: string }[]>(`/assets/resources.json`).subscribe({
      next: (list) => {
        this.resources = Array.isArray(list) ? list.slice(0, 30) : [];
        this.applyOrderingAndFilter();
        // Preseleciona item correspondente ao resource atual (se houver no catálogo)
        const match = this.resources.find(r => this.normalize(r.path) === this.normalize(this.resourcePath));
        if (match) this.selectedResource = match;
      },
      error: () => { this.resources = []; this.applyOrderingAndFilter(); }
    });
  }

  private applyOrderingAndFilter(): void {
    const priority = new Map<string, number>();
    [
      '/human-resources/funcionarios',
      '/human-resources/incidentes',
      '/human-resources/indenizacoes',
      '/human-resources/missoes',
      '/human-resources/reputacoes',
      '/human-resources/departamentos',
      '/human-resources/cargos',
    ].forEach((p, i) => priority.set(p, i));

    const norm = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const term = norm(this.searchTerm);

    const sorted = [...this.resources].sort((a, b) => {
      const pa = priority.has(a.path) ? priority.get(a.path)! : Number.MAX_SAFE_INTEGER;
      const pb = priority.has(b.path) ? priority.get(b.path)! : Number.MAX_SAFE_INTEGER;
      if (pa !== pb) return pa - pb;
      return a.title.localeCompare(b.title, 'pt-BR');
    });

    this.viewResources = term
      ? sorted.filter(r => norm(r.title).includes(term) || norm(r.description).includes(term))
      : sorted;
  }

  onFilter(ev: Event): void {
    const v = (ev.target as HTMLInputElement)?.value ?? '';
    this.searchTerm = v;
    this.applyOrderingAndFilter();
  }

  clearFilter(): void { this.searchTerm = ''; this.applyOrderingAndFilter(); }

  applyResource(path: string): void {
    const rp = this.normalize(path);
    this.resourcePath = rp;
    this.resourceInput = rp;
    try { history.replaceState({ ...(history.state||{}), resource: rp }, ''); } catch {}
    // Atualiza query param para facilitar compartilhamento de URL
    try { this.router.navigate([], { queryParams: { resource: rp }, queryParamsHandling: 'merge' }); } catch {}
    // Persiste última escolha
    try { localStorage.setItem(this.storageKey, rp); } catch {}
    this.pushMetadata();
  }

  onApplyCustom(ev?: Event): void {
    ev?.preventDefault();
    const rp = this.normalize(this.resourceInput || this.resourcePath);
    this.applyResource(rp);
  }

  private normalize(p: string): string { let x = (p||'').trim(); if (!x.startsWith('/')) x = '/' + x; return x.replace(/\/$/, ''); }
}
