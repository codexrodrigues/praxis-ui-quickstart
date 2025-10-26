import { Component, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PraxisDynamicForm } from '@praxisui/dynamic-form';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomizationModeService } from '../../core/services/customization-mode.service';
import { TableMetadataBridgeService } from '../../core/layout/table-metadata-bridge.service';

type FormMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-form-demo-page',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatTooltipModule, PraxisDynamicForm],
  template: `
    <section class="didactic-card gradient-border" aria-label="Explorar formulários dinâmicos">
      <div class="card-body">
        <div class="card-left">
          <h3 class="title">Monte e teste formulários</h3>
          <p class="subtitle">Altere <strong>recurso</strong> e <strong>modo</strong>; escolhemos um registro automaticamente para demonstrar Edição/Visualização.</p>
          <div class="quick-options" role="group" aria-label="Atalhos de recursos">
            <button type="button" class="chip" (click)="applyResource('/human-resources/funcionarios')">
              <span class="material-symbols-outlined" aria-hidden="true">group</span>
              <span>Funcionários</span>
            </button>
            <button type="button" class="chip" (click)="applyResource('/human-resources/incidentes')">
              <span class="material-symbols-outlined" aria-hidden="true">report</span>
              <span>Incidentes</span>
            </button>
            <button type="button" class="chip" (click)="applyResource('/human-resources/indenizacoes')">
              <span class="material-symbols-outlined" aria-hidden="true">payments</span>
              <span>Indenizações</span>
            </button>
          </div>

          <div class="mode-controls" role="group" aria-label="Modo do formulário">
            <label class="label">Modo</label>
            <div class="segmented">
              <button type="button" class="seg" [class.active]="mode==='create'" (click)="setMode('create')" matTooltip="Novo registro" aria-label="Modo: Novo">Novo</button>
              <button type="button" class="seg" [class.active]="mode==='edit'" (click)="setMode('edit')" matTooltip="Editar registro existente" aria-label="Modo: Editar">Editar</button>
              <button type="button" class="seg" [class.active]="mode==='view'" (click)="setMode('view')" matTooltip="Visualizar registro" aria-label="Modo: Visualizar">Visualizar</button>
            </div>
          </div>

          <div class="id-controls" role="group" aria-label="Registro de exemplo" *ngIf="mode!=='create'">
            <label class="label">Registro de exemplo</label>
            <div class="input-row">
              <input class="text" type="text" [value]="resourceId ? '#' + resourceId : 'Descobrindo…'" disabled aria-label="ID de exemplo" />
              <button type="button" class="apply" (click)="refreshSample()" matTooltip="Escolher outro registro de exemplo" aria-label="Trocar registro de exemplo">Trocar</button>
            </div>
            <small class="hint">Buscamos um registro automaticamente em {{ resourcePath }} para demonstrar {{ mode==='edit' ? 'Edição' : 'Visualização' }}.</small>
          </div>
        </div>

        <form class="card-right" (submit)="onApplySelected($event)" aria-label="Escolher recurso">
          <label for="resourceSelect" class="label">Recurso</label>
          <mat-form-field appearance="fill" class="select-field">
            <mat-label>Escolher um recurso</mat-label>
            <mat-select [(value)]="selectedResource" panelClass="resource-select-panel" id="resourceSelect">
              <mat-option disabled class="search-option">
                <div class="search-row" (click)="$event.stopPropagation()">
                  <span class="material-symbols-outlined" aria-hidden="true">search</span>
                  <input type="text" [value]="searchTerm" (input)="onFilter($event)" placeholder="Buscar por nome…" aria-label="Buscar recurso" />
                  <button type="button" class="clear" *ngIf="searchTerm" (click)="clearFilter(); $event.stopPropagation();" aria-label="Limpar busca">Limpar</button>
                </div>
              </mat-option>
              <ng-container *ngFor="let r of viewResources">
                <mat-option [value]="r">
                  <div class="opt">
                    <span class="material-symbols-outlined" aria-hidden="true">{{ r.icon || 'dynamic_form' }}</span>
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
          <div class="btn-row">
            <button type="button" class="apply" (click)="selectedResource && applyResource(selectedResource.path)" aria-label="Aplicar recurso">Aplicar</button>
            <button type="button" class="btn copy" (click)="copyLink()" aria-label="Copiar link">Copiar link</button>
          </div>
          <small class="hint">A URL reflete <code>?resource</code>, <code>?mode</code> e <code>?id</code> para compartilhamento.</small>
        </form>
      </div>
    </section>

    <div *ngIf="statusMessage" class="toast" role="alert">{{ statusMessage }}</div>

    <praxis-dynamic-form
      [formId]="demoFormId"
      [resourcePath]="resourcePath"
      [resourceId]="resourceId || undefined"
      [mode]="mode"
      [editModeEnabled]="custom.enabled()"
      (formSubmit)="onFormSubmit($event)"
      (formReady)="onFormReady($event)"
      (schemaStatusChange)="onSchemaStatusChange($event)"
      (valueChange)="onValueChange($event)"
      (initializationError)="onInitError($event)"
    ></praxis-dynamic-form>
  `,
  styles: [`
    :host { display: block; }
    .didactic-card { margin-bottom: 10px; border-radius: 10px; }
    .didactic-card .card-body { display: grid; grid-template-columns: 1fr; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 10px; }
    @media (min-width: 1024px) { .didactic-card .card-body { grid-template-columns: 1.2fr 1fr; } }
    .title { margin: 0 0 6px; font-size: 18px; font-weight: 700; background: linear-gradient(90deg, var(--praxis-violet, #8b5cf6), var(--praxis-emerald, #10b981)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { margin: 0 0 12px; color: #c9c9d6; }
    .quick-options { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
    .chip { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.06); color: #eaeaf1; }
    .chip .material-symbols-outlined { font-size: 16px; }
    .mode-controls, .id-controls { margin-top: 10px; }
    .label { display: block; font-size: 12px; color: #b8b8c6; margin: 0 0 6px; }
    .segmented { display: inline-flex; border: 1px solid rgba(255,255,255,0.18); border-radius: 8px; overflow: hidden; }
    .seg { height: 28px; padding: 0 10px; background: rgba(255,255,255,0.06); color: #eaeaf1; border-right: 1px solid rgba(255,255,255,0.14); }
    .seg:last-child { border-right: 0; }
    .seg.active { background: linear-gradient(90deg, #60a5fa, #8b5cf6); color: #fff; }
    .input-row { display: flex; gap: 8px; }
    .text { flex: 1 1 auto; height: 32px; padding: 0 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.06); color: #eaeaf1; outline: none; }
    .apply { height: 32px; padding: 0 12px; border-radius: 8px; background: linear-gradient(90deg, #60a5fa, #8b5cf6); color: #fff; border: 1px solid rgba(255,255,255,0.22); }
    .btn-row { display: flex; gap: 8px; }
    .btn.copy { height: 32px; padding: 0 12px; border-radius: 8px; background: rgba(255,255,255,0.06); color: #eaeaf1; border: 1px solid rgba(255,255,255,0.18); }
    .or { margin: 8px 0; text-align: center; color: #9aa0a6; font-size: 12px; }
    .select-field { width: 100%; }
    .search-option { position: sticky; top: 0; z-index: 1; background: #1f2937; }
    .search-row { display: flex; align-items: center; gap: 6px; padding: 6px; }
    .search-row input { flex: 1 1 auto; height: 28px; padding: 0 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.06); color: #eaeaf1; outline: none; }
    .search-row .clear { height: 28px; padding: 0 8px; border-radius: 8px; background: rgba(255,255,255,0.06); color: #eaeaf1; border: 1px solid rgba(255,255,255,0.18); }
    .opt { display: flex; align-items: center; gap: 8px; }
    .opt .opt-title { font-weight: 600; }
    .opt .opt-desc { font-size: 12px; color: #9aa0a6; }
    .toast { margin: 8px 0 10px; padding: 8px 10px; border-radius: 8px; background: rgba(28, 200, 138, 0.12); border: 1px solid rgba(28, 200, 138, 0.4); color: #c7f5dc; font-size: 12px; }
  `]
})
export class FormDemoPage implements AfterViewInit {
  protected resourcePath = '/human-resources/funcionarios';
  protected mode: FormMode = 'create';
  protected resourceId = '';
  protected statusMessage = '';

  private storageKey = 'form-demo:state';
  private hasExternalState = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected custom = inject(CustomizationModeService);
  private bridge = inject(TableMetadataBridgeService);
  private http = inject(HttpClient);

  @ViewChild(PraxisDynamicForm) private formRef?: any;

  selectedResource: { path: string; title: string; description: string; icon?: string } | null = null;
  resources: { path: string; title: string; description: string; icon?: string }[] = [];
  viewResources: { path: string; title: string; description: string; icon?: string }[] = [];
  searchTerm = '';

  constructor() {
    // 1) Estado de navegação (invisível na URL)
    const nav = this.router.getCurrentNavigation()?.extras?.state;
    const navRes = (nav?.['resource'] || '').toString().trim();
    const navMode = (nav?.['mode'] || '').toString().trim();
    const navId = (nav?.['id'] || '').toString().trim();
    if (navRes) { this.resourcePath = this.normalize(navRes); this.hasExternalState = true; }
    if (navMode) { this.mode = this.normalizeMode(navMode); this.hasExternalState = true; }
    if (navId) { this.resourceId = navId; this.hasExternalState = true; }

    // 2) Estado do histórico (em reload)
    const hist: any = history?.state || {};
    const histRes = (hist['resource'] || '').toString().trim();
    const histMode = (hist['mode'] || '').toString().trim();
    const histId = (hist['id'] || '').toString().trim();
    if (histRes) { this.resourcePath = this.normalize(histRes); this.hasExternalState = true; }
    if (histMode) { this.mode = this.normalizeMode(histMode); this.hasExternalState = true; }
    if (histId) { this.resourceId = histId; this.hasExternalState = true; }

    // 3) Query params (visível)
    this.route.queryParamMap.subscribe((q) => {
      const qr = (q.get('resource') || '').trim();
      const qm = (q.get('mode') || '').trim();
      const qi = (q.get('id') || '').trim();
      if (qr) { this.resourcePath = this.normalize(qr); this.hasExternalState = true; }
      if (qm) { this.mode = this.normalizeMode(qm); this.hasExternalState = true; }
      if (qi) { this.resourceId = qi; this.hasExternalState = true; }
    });
    const snap = this.route.snapshot.queryParamMap;
    const sr = (snap.get('resource') || '').trim();
    const sm = (snap.get('mode') || '').trim();
    const si = (snap.get('id') || '').trim();
    if (sr) { this.resourcePath = this.normalize(sr); this.hasExternalState = true; }
    if (sm) { this.mode = this.normalizeMode(sm); this.hasExternalState = true; }
    if (si) { this.resourceId = si; this.hasExternalState = true; }

    // 4) Persistido (apenas se nada veio de fora)
    if (!this.hasExternalState) {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const obj = JSON.parse(saved);
          if (obj && typeof obj === 'object') {
            if (obj.resource) this.resourcePath = this.normalize(obj.resource);
            if (obj.mode) this.mode = this.normalizeMode(obj.mode);
            if (obj.id) this.resourceId = String(obj.id);
          }
        }
      } catch {}
    }
  }

  ngAfterViewInit(): void {
    this.loadResources();
    setTimeout(() => { this.ensureIdForMode(); this.pushMetadata(); }, 0);
  }

  // UI handlers
  setMode(m: FormMode): void { this.mode = m; this.ensureIdForMode(); this.persistAndReflect(); this.pushMetadata(); }
  onApplySelected(ev?: Event): void { ev?.preventDefault(); if (this.selectedResource) this.applyResource(this.selectedResource.path); }
  applyResource(path: string): void {
    const rp = this.normalize(path);
    this.resourcePath = rp;
    this.ensureIdForMode();
    this.persistAndReflect();
    this.pushMetadata();
  }
  refreshSample(): void { this.resourceId = ''; this.ensureIdForMode(true); }

  copyLink(): void {
    const url = this.buildShareUrl();
    try { navigator.clipboard?.writeText(url); this.status(`Link copiado!`); }
    catch { this.status(`URL: ${url}`); }
  }

  onFormReady(_ev: any): void { this.status('Form pronto.'); this.pushMetadata(); }
  onSchemaStatusChange(_ev: any): void { this.pushMetadata(); }
  onFormSubmit(_ev: any): void { this.status(this.mode === 'create' ? 'Enviando POST…' : this.mode === 'edit' ? 'Enviando PUT…' : 'Visualização — sem envio.'); }
  onValueChange(_ev: any): void { /* noop for demo */ }
  onInitError(err: any): void { this.status('Falha ao inicializar o formulário.'); /* eslint-disable-next-line no-console */ console.warn('DynamicForm init error', err); }

  // Bridge metadata to Shell (for docs panel)
  private pushMetadata(): void {
    try {
      const rp = this.resourcePath;
      this.bridge.setResourcePath(rp);
      // Config (se exposto)
      const cfg = (this.formRef as any)?.config ?? null;
      if (cfg) this.bridge.setConfig(cfg);
      // Schema raw via cache interno do GenericCrudService
      const svc: any = (this.formRef as any)?.crudService;
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
  
  private discovering = false;
  private ensureIdForMode(force = false): void {
    if (this.mode === 'create') { return; }
    if (!force && this.resourceId) { return; }
    if (this.discovering) { return; }
    this.discovering = true;
    const url = `/api${this.resourcePath}/all`;
    this.http.get<any>(url).subscribe({
      next: (data) => {
        const item = Array.isArray(data) ? data[0] : (data?.content?.[0] ?? null);
        const id = this.extractId(item);
        if (id != null) {
          this.resourceId = String(id);
          this.persistAndReflect();
          this.status(`Usando registro #${this.resourceId} para demonstração.`);
          this.pushMetadata();
        } else {
          this.status('Não foi possível identificar o ID do primeiro registro.');
        }
      },
      error: () => {
        this.status('Falha ao buscar registros para demonstração.');
      },
      complete: () => { this.discovering = false; }
    });
  }

  private extractId(obj: any): string | number | null {
    if (!obj || typeof obj !== 'object') return null;
    if ('id' in obj) return obj['id'];
    const candidates = Object.keys(obj).filter(k => /id$|^id$|codigo|code|uuid|key/i.test(k));
    for (const k of candidates) { const v = (obj as any)[k]; if (v != null && v !== '') return v; }
    for (const k of Object.keys(obj)) { const v = (obj as any)[k]; if (typeof v === 'number') return v; }
    return null;
  }

  // Resources catalog
  private loadResources(): void {
    this.http.get<{ path: string; title: string; description: string; icon?: string }[]>(`/assets/resources.json`).subscribe({
      next: (list) => {
        this.resources = Array.isArray(list) ? list.slice(0, 30) : [];
        this.applyOrderingAndFilter();
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
  onFilter(ev: Event): void { this.searchTerm = (ev.target as HTMLInputElement)?.value ?? ''; this.applyOrderingAndFilter(); }
  clearFilter(): void { this.searchTerm = ''; this.applyOrderingAndFilter(); }

  // Helpers
  private persistAndReflect(): void {
    // Guarda no history.state para reloads
    try { history.replaceState({ ...(history.state||{}), resource: this.resourcePath, mode: this.mode, id: this.resourceId }, ''); } catch {}
    // Atualiza query params para compartilhar URL
    try { this.router.navigate([], { queryParams: { resource: this.resourcePath, mode: this.mode, id: this.mode === 'create' ? null : (this.resourceId || null) }, queryParamsHandling: 'merge' }); } catch {}
    // Persistência local
    try { localStorage.setItem(this.storageKey, JSON.stringify({ resource: this.resourcePath, mode: this.mode, id: this.resourceId })); } catch {}
  }
  private buildShareUrl(): string {
    const base = window.location.origin + this.router.createUrlTree(['/componentes/form']).toString();
    const params = new URLSearchParams({ resource: this.resourcePath, mode: this.mode });
    if (this.mode !== 'create' && this.resourceId) params.set('id', this.resourceId);
    return `${base}?${params.toString()}`;
  }
  private normalize(p: string): string { let x = (p||'').trim(); if (!x.startsWith('/')) x = '/' + x; return x.replace(/\/$/, ''); }
  private normalizeMode(m: string): FormMode { const v = (m||'').toLowerCase(); return v==='edit'||v==='view' ? v : 'create'; }
  private status(msg: string): void { this.statusMessage = msg; setTimeout(() => { if (this.statusMessage === msg) this.statusMessage = ''; }, 2000); }

  // Stable per-resource formId for config persistence and init gate
  get demoFormId(): string {
    const norm = this.resourcePath.replace(/^\//, '').replace(/[^\w-]+/g, '_');
    return `form-demo:${norm}`;
  }
}
