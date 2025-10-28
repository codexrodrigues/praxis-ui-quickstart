import { Component, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { PraxisDynamicForm } from '@praxisui/dynamic-form';
import { MaterialAsyncSelectComponent } from '@praxisui/dynamic-fields';
import { AppConfigService } from '../../core/config/app-config.service';
import { GenericCrudService } from '@praxisui/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomizationModeService } from '../../core/services/customization-mode.service';
import { TableMetadataBridgeService } from '../../core/layout/table-metadata-bridge.service';

type FormMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-form-demo-page',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatTooltipModule, MatIconModule, MatMenuModule, PraxisDynamicForm, MaterialAsyncSelectComponent],
  template: `
    <section class="didactic-card gradient-border" aria-label="Explorar formulários dinâmicos">
      <div class="card-body">
        <div class="card-left">
          <h3 class="title">Monte e teste formulários</h3>
          <p class="subtitle">Escolha o <strong>recurso</strong> e o <strong>modo</strong> para carregar um formulário de exemplo.</p>
        </div>
        
      </div>
    </section>

    <div *ngIf="statusMessage" class="toast" role="alert">{{ statusMessage }}</div>

    <section class="form-card" aria-label="Formulário selecionado">
      <!-- Toggle flutuante: Modo design (overlay no canto superior direito) -->
      <button type="button" class="design-toggle"
              [class.on]="custom.enabled()"
              (click)="custom.toggle()"
              [attr.aria-pressed]="custom.enabled()"
              aria-label="Alternar Modo design"
              [matTooltip]="custom.enabled()
                ? 'Desativar Modo design\nOculta recursos de configuração do container.\nEm produção, use apenas com administradores.'
                : 'Modo design\nHabilita recursos de configuração do container.\nNa Tabela: exibe o botão de Configurações para abrir o editor.\nEm produção, use apenas com administradores.'"
              [matTooltipClass]="'tooltip-edit'"
              [matTooltipShowDelay]="150"
              matTooltipPosition="below">
        <span class="label">Modo design</span>
        <span class="switch" aria-hidden="true"><span class="thumb"></span></span>
      </button>
      <header class="form-card__header form-header">
        <div class="left">
          <div class="titles" [class.fade]="fadeOn">
            <div class="title-row">
              <mat-icon class="resource-icon" [fontIcon]="selectedResource?.icon || 'dataset'" aria-hidden="true"></mat-icon>
              <h2 class="h">{{ (selectedResource?.displayName || selectedResource?.title) || 'Selecione um recurso' }}</h2>
              <button mat-icon-button class="change-btn" [matMenuTriggerFor]="resourceMenu" matTooltip="Trocar recurso" aria-label="Trocar recurso">
                <mat-icon>arrow_drop_down</mat-icon>
              </button>
            </div>
            <p class="s">{{ selectedResource?.description || 'Nenhum recurso selecionado' }}</p>
            <!-- Modo (ícones com tooltip) - abaixo da seleção de recursos -->
            <div class="header-mode compact" role="group" aria-label="Modo do formulário">
              <button type="button" class="seg" [class.active]="mode==='create'" (click)="setMode('create')" matTooltip="Alterar para o modo Novo" aria-label="Novo">
                <mat-icon>add</mat-icon>
              </button>
              <button type="button" class="seg" [class.active]="mode==='edit'" (click)="setMode('edit')" matTooltip="Alterar para o modo Editar" aria-label="Editar">
                <mat-icon>edit</mat-icon>
              </button>
              <button type="button" class="seg" [class.active]="mode==='view'" (click)="setMode('view')" matTooltip="Alterar para o modo Visualizar" aria-label="Visualizar">
                <mat-icon>visibility</mat-icon>
              </button>
            </div>
            <!-- Registro (compacto, abaixo do modo) -->
            <ng-container *ngIf="mode !== 'create'">
              <pdx-material-async-select
                class="header-record compact"
                [class.filled]="!!resourceId"
                #recordSelect
                [label]="'Registro'"
                (optionsLoaded)="onRecordOptionsLoaded($event)"
                (selectionChange)="onRecordSelectionChange($event)"
              ></pdx-material-async-select>
            </ng-container>
          </div>
          <mat-menu #resourceMenu="matMenu">
            <button mat-menu-item *ngFor="let r of resources" (click)="selectResource(r)">
              <mat-icon [fontIcon]="r.icon || 'dataset'" aria-hidden="true"></mat-icon>
              <span>{{ r.displayName || r.title }}</span>
            </button>
          </mat-menu>
        </div>
        <div class="actions">
          <!-- Recursos (linha 2) substituído por menu → removido o select -->
        </div>
      </header>
      <div class="form-card__body">
          <praxis-dynamic-form
          *ngIf="formAlive"
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
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .didactic-card { margin-bottom: 10px; border-radius: 10px; }
    .didactic-card .card-body { display: grid; grid-template-columns: 1fr; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 10px; }
    .title { margin: 0 0 6px; font-size: 18px; font-weight: 700; background: linear-gradient(90deg, var(--praxis-violet, #8b5cf6), var(--praxis-emerald, #10b981)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { margin: 0 0 12px; color: #c9c9d6; }
    .quick-options { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
    .chip { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.06); color: #eaeaf1; }
    .chip .material-symbols-outlined { font-size: 16px; }
    .mode-controls, .id-controls, .resource-controls { margin-top: 10px; }
    .label { display: block; font-size: 12px; color: #b8b8c6; margin: 0 0 6px; }
    .segmented { display: inline-flex; border: 1px solid rgba(255,255,255,0.18); border-radius: 8px; overflow: hidden; }
    .seg { height: 28px; padding: 0 10px; background: rgba(255,255,255,0.06); color: #eaeaf1; border-right: 1px solid rgba(255,255,255,0.14); }
    .seg:last-child { border-right: 0; }
    .seg.active { background: linear-gradient(90deg, #60a5fa, #8b5cf6); color: #fff; }
    /* Compact mode buttons (no borders, smaller, under resource) */
    .header-mode.compact { margin-top: 6px; display: inline-flex; gap: 4px; border: 0; overflow: visible; }
    .header-mode.compact .seg { height: 24px; padding: 0 6px; background: transparent; border-right: 0; color: #cfd3da; border-radius: 6px; }
    .header-mode.compact .seg .mat-icon { font-size: 18px; width: 18px; height: 18px; line-height: 18px; }
    .header-mode.compact .seg.active { background: rgba(96,165,250,0.20); color: #ffffff; }
    .header-mode.compact .seg:hover { background: rgba(255,255,255,0.07); }
    .input-row { display: flex; gap: 8px; }
    .text { flex: 1 1 auto; height: 32px; padding: 0 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.06); color: #eaeaf1; outline: none; }
    .apply { height: 32px; padding: 0 12px; border-radius: 8px; background: linear-gradient(90deg, #60a5fa, #8b5cf6); color: #fff; border: 1px solid rgba(255,255,255,0.22); }
    .apply.alt { background: rgba(255,255,255,0.06); color: #eaeaf1; border: 1px solid rgba(255,255,255,0.18); }
    .btn-row { display: flex; gap: 8px; }
    .btn.copy { height: 32px; padding: 0 12px; border-radius: 8px; background: rgba(255,255,255,0.06); color: #eaeaf1; border: 1px solid rgba(255,255,255,0.18); }
    .or { margin: 8px 0; text-align: center; color: #9aa0a6; font-size: 12px; }
    .select-field { width: 100%; }
    .prefix-icon { font-size: 18px; width: 18px; height: 18px; line-height: 18px; margin-right: 4px; }
    .resource-field { position: relative; }
    .confirm-badge { position: absolute; top: 6px; right: 8px; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.45); color: #a7f3d0; border-radius: 999px; padding: 2px 8px; font-size: 11px; }
    .selected-desc { margin-top: 6px; color: #9aa0a6; font-size: 12px; }
    .selected-desc .mod { color: #a1a1aa; }
    .placeholder { color: #9aa0a6; }
    .trigger-desc-only { font-size: 12px; color: #9aa0a6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 52vw; }
    .trigger-opt { display: inline-flex; align-items: center; gap: 8px; min-width: 0; }
    .trigger-opt .mat-icon { font-size: 18px; width: 18px; height: 18px; line-height: 18px; }
    .trigger-opt .opt-text { line-height: 1.1; min-width: 0; }
    .trigger-opt .opt-desc { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 52vw; }
    .search-option { position: sticky; top: 0; z-index: 1; background: #1f2937; }
    .search-row { display: flex; align-items: center; gap: 6px; padding: 6px; }
    .search-row input { flex: 1 1 auto; height: 28px; padding: 0 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.06); color: #eaeaf1; outline: none; }
    .search-row .clear { height: 28px; padding: 0 8px; border-radius: 8px; background: rgba(255,255,255,0.06); color: #eaeaf1; border: 1px solid rgba(255,255,255,0.18); }
    .opt { display: flex; align-items: center; gap: 8px; padding: 6px 0; }
    .opt .mat-icon { font-size: 18px; width: 18px; height: 18px; line-height: 18px; }
    .opt .opt-title { font-weight: 600; }
    .opt .opt-desc { font-size: 12px; color: #9aa0a6; }
    .hint-row { display:flex; gap: 12px; align-items:center; }
    .hint.loading { color: #9aa0a6; }
    .toast { margin: 8px 0 10px; padding: 8px 10px; border-radius: 8px; background: rgba(28, 200, 138, 0.12); border: 1px solid rgba(28, 200, 138, 0.4); color: #c7f5dc; font-size: 12px; }
    ::ng-deep .resource-select-panel .mat-mdc-option { border-bottom: 1px solid rgba(255,255,255,0.06); }
    ::ng-deep .resource-select-panel .mat-mdc-option:last-child { border-bottom: 0; }
    .field-hint { color: #9aa0a6; }
    /* Form card */
    .form-card { margin-top: 12px; border-radius: 10px; background: var(--md-sys-color-surface-container, rgba(255,255,255,0.03)); border: 1px solid var(--md-sys-color-outline-variant, rgba(255,255,255,0.12)); position: relative; }
    .form-card__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; padding: 10px 12px; border-bottom: 1px solid var(--md-sys-color-outline-variant, rgba(255,255,255,0.12)); }
    .form-header { background: linear-gradient(90deg, rgba(34,36,40,0.9), rgba(28,29,33,0.9)); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; }
    .form-card__header .left { display: inline-flex; align-items: flex-start; gap: 10px; }
    .form-card__header .resource-icon { font-size: 20px; width: 20px; height: 20px; color: var(--mat-sys-color-primary, #60a5fa); }
    /* Alinha o ícone com a linha do título */
    .form-card__header .title-row .resource-icon { margin-right: 6px; align-self: baseline; transform: translateY(0); }
    .form-card__header .titles { display: flex; flex-direction: column; line-height: 1.2; }
    .form-card__header .title-row { display: inline-flex; align-items: baseline; gap: 4px; }
    .form-card__header .change-btn { margin-left: 2px; }
    .form-card__header .h { margin: 0; font-weight: 700; font-size: 15px; color: var(--md-sys-color-primary, #60a5fa); letter-spacing: .2px; }
    .form-card__header .s { margin: 0; font-size: 12.5px; color: var(--text-muted, #9aa0a6); opacity: .6; padding-left: 2px; }
    .form-card__header .actions { margin-left: auto; display: inline-flex; align-items: flex-start; gap: 10px; }
    /* Espaçamento vertical entre recurso (título/descrição) e controles */
    .form-card__header .titles > .header-mode.compact { margin-top: 12px; }
    .form-card__header .titles > .header-record.compact { margin-top: 10px; }
    .form-card__header .header-mode .seg { height: 28px; }
    .form-card__header .header-mode.compact .seg { height: 24px; }
    .form-card__header .header-record { width: 200px; }
    .header-record.compact { width: auto; display: inline-flex; align-items: center; }
    /* Compact Material field styling for record selector */
    ::ng-deep .header-record.compact .mat-mdc-form-field-subscript-wrapper { display: none; }
    ::ng-deep .header-record.compact .mat-mdc-form-field-label { display: none; }
    ::ng-deep .header-record.compact .mat-mdc-form-field-infix { padding: 0 !important; min-height: 0; }
    ::ng-deep .header-record.compact .mdc-text-field { height: auto; min-height: 0; }
    ::ng-deep .header-record.compact .mat-mdc-form-field-focus-overlay,
    ::ng-deep .header-record.compact .mat-mdc-form-field-ripple { display: none; }
    ::ng-deep .header-record.compact .mdc-line-ripple { display: none; }
    ::ng-deep .header-record.compact .mdc-notched-outline { display: none; }
    ::ng-deep .header-record.compact .mat-mdc-text-field-wrapper { background: transparent !important; border: 0 !important; border-radius: 0; padding: 0; box-shadow: none; }
    /* Apenas o texto selecionado (sem bordas) com seta */
    ::ng-deep .header-record.compact .mat-mdc-form-field-flex { align-items: center; }
    ::ng-deep .header-record.compact .mat-mdc-select-trigger { height: 20px; line-height: 20px; padding: 0; }
    ::ng-deep .header-record.compact .mat-mdc-select-value-text { color: var(--md-sys-color-primary, #60a5fa); font-weight: 700; }
    ::ng-deep .header-record.compact .mat-mdc-select-arrow-wrapper { transform: scale(0.9); margin-left: 2px; opacity: .9; }
    ::ng-deep .header-record.compact:hover .mat-mdc-select-trigger { text-decoration: underline; }
    ::ng-deep .header-record.compact .mat-mdc-form-field-icon-suffix .mat-icon, 
    ::ng-deep .header-record.compact .mat-mdc-form-field-icon-prefix .mat-icon { font-size: 18px; width: 18px; height: 18px; line-height: 18px; }
    .form-card__header .edit-toggle { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; background: transparent; border: 0; padding: 0; }
    .form-card__header .edit-toggle .label { font-size: 12px; color: var(--text-muted); letter-spacing: .2px; display: inline-flex; align-items: center; gap: 6px; }
    .form-card__header .edit-toggle .label::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.22); opacity: 0; transition: opacity .15s ease, background .15s ease; }
    .form-card__header .edit-toggle .switch { width: 40px; height: 20px; border-radius: 999px; border: 1px solid rgba(255,255,255,.22); background: rgba(255,255,255,0.08); position: relative; transition: background .15s ease, border-color .15s ease; }
    .form-card__header .edit-toggle .thumb { width: 16px; height: 16px; border-radius: 50%; position: absolute; top: 1px; left: 1px; background: #eaeaf1; transition: left .15s ease, background .15s ease; }
    .form-card__header .edit-toggle.on .switch { background: linear-gradient(90deg, #60a5fa, #8b5cf6); border-color: rgba(255,255,255,.28); box-shadow: 0 0 0 1px rgba(255,255,255,0.08) inset, 0 0 10px rgba(96,165,250,0.25); }
    .form-card__header .edit-toggle.on .thumb { left: 21px; background: #ffffff; }
    .form-card__header .edit-toggle.on .label { color: var(--brand-grad-start); font-weight: 700; }
    .form-card__header .edit-toggle.on .label::before { opacity: 1; background: linear-gradient(90deg, var(--brand-grad-start), var(--brand-grad-end)); }
    .form-card__body { padding: 12px; }
    /* Fade in for title/description upon resource change */
    @keyframes fadeInShort { from { opacity: 0; transform: translateY(-2px); } to { opacity: 1; transform: translateY(0); } }
    .titles.fade { animation: fadeInShort 150ms ease; }
    /* Toggle flutuante: Modo design */
    .design-toggle { position: absolute; top: 8px; right: 10px; z-index: 2; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; background: rgba(0,0,0,0.08); backdrop-filter: blur(2px); border: 1px solid rgba(255,255,255,0.15); padding: 4px 8px; border-radius: 999px; }
  `]
})
export class FormDemoPage implements AfterViewInit {
  protected resourcePath = '/human-resources/funcionarios';
  protected mode: FormMode = 'create';
  protected resourceId = '';
  protected resourceIdInput = '';
  protected statusMessage = '';
  private readonly DEBUG = typeof window !== 'undefined' && Boolean((window as any)['__PRAXIS_DEBUG__']);

  private storageKey = 'form-demo:state';
  private hasExternalState = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected custom = inject(CustomizationModeService);
  private bridge = inject(TableMetadataBridgeService);
  private http = inject(HttpClient);
  private appConfig = inject(AppConfigService);
  private crud = inject(GenericCrudService);

  @ViewChild(PraxisDynamicForm) private formRef?: any;
  @ViewChild('recordSelect') private recordSelect?: MaterialAsyncSelectComponent;
  formAlive = true;

  selectedResource: { path: string; title: string; description: string; icon?: string; displayName?: string } | null = null;
  resources: { path: string; title: string; description: string; icon?: string; displayName?: string }[] = [];
  viewResources: { path: string; title: string; description: string; icon?: string; displayName?: string }[] = [];
  searchTerm = '';
  selectionConfirmed = false;
  fadeOn = false;
  get resourceLabel(): string {
    try {
      const t = (this.selectedResource?.title || '').trim();
      return t || 'Selecione um recurso';
    } catch { return 'Selecione um recurso'; }
  }

  constructor() {
    // 1) Estado de navegação (invisível na URL)
    const nav = this.router.getCurrentNavigation()?.extras?.state;
    const navRes = (nav?.['resource'] || '').toString().trim();
    const navMode = (nav?.['mode'] || '').toString().trim();
    const navId = (nav?.['id'] || '').toString().trim();
    if (navRes) { this.resourcePath = this.normalize(navRes); this.hasExternalState = true; }
    if (navMode) { this.mode = this.normalizeMode(navMode); this.hasExternalState = true; }
    if (navId) { this.resourceId = navId; this.resourceIdInput = navId; this.hasExternalState = true; }

    // 2) Estado do histórico (em reload)
    const hist: any = history?.state || {};
    const histRes = (hist['resource'] || '').toString().trim();
    const histMode = (hist['mode'] || '').toString().trim();
    const histId = (hist['id'] || '').toString().trim();
    if (histRes) { this.resourcePath = this.normalize(histRes); this.hasExternalState = true; }
    if (histMode) { this.mode = this.normalizeMode(histMode); this.hasExternalState = true; }
    if (histId) { this.resourceId = histId; this.resourceIdInput = histId; this.hasExternalState = true; }

    // 3) Query params (visível)
    this.route.queryParamMap.subscribe((q) => {
      const qr = (q.get('resource') || '').trim();
      const qm = (q.get('mode') || '').trim();
      const qi = (q.get('id') || '').trim();
      if (qr) { this.resourcePath = this.normalize(qr); this.hasExternalState = true; }
      if (qm) { this.mode = this.normalizeMode(qm); this.hasExternalState = true; }
      if (qi) { this.resourceId = qi; this.resourceIdInput = qi; this.hasExternalState = true; }
    });
    const snap = this.route.snapshot.queryParamMap;
    const sr = (snap.get('resource') || '').trim();
    const sm = (snap.get('mode') || '').trim();
    const si = (snap.get('id') || '').trim();
    if (sr) { this.resourcePath = this.normalize(sr); this.hasExternalState = true; }
    if (sm) { this.mode = this.normalizeMode(sm); this.hasExternalState = true; }
    if (si) { this.resourceId = si; this.resourceIdInput = si; this.hasExternalState = true; }

    // 4) Persistido (apenas se nada veio de fora)
    if (!this.hasExternalState) {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const obj = JSON.parse(saved);
          if (obj && typeof obj === 'object') {
            if (obj.resource) this.resourcePath = this.normalize(obj.resource);
            if (obj.mode) this.mode = this.normalizeMode(obj.mode);
            if (obj.id) { this.resourceId = String(obj.id); this.resourceIdInput = String(obj.id); }
          }
        }
      } catch {}
    }
  }

  ngAfterViewInit(): void {
    this.loadResources();
    setTimeout(() => { this.ensureIdForMode(); this.pushMetadata(); }, 0);
    // Configure async select after view init if needed
    setTimeout(() => { this.configureRecordSelect(); }, 0);
  }

  // UI handlers
  setMode(m: FormMode): void {
    this.mode = m;
    if (this.resourceId) this.resourceIdInput = this.resourceId;
    // Defer to allow view to render record selector when switching from create
    setTimeout(() => this.ensureIdForMode(), 0);
    this.persistAndReflect();
    this.pushMetadata();
    this.log('mode changed', { mode: this.mode, resourcePath: this.resourcePath, demoFormId: this.demoFormId });
    // Reconfigure record selector when switching to edit/view or back (after view updates)
    setTimeout(() => this.configureRecordSelect(true), 0);
  }
  onApplySelected(ev?: Event): void { ev?.preventDefault(); if (this.selectedResource) this.applyResource(this.selectedResource.path); }
  applyResource(path: string): void {
    const rp = this.normalize(path);
    this.resourcePath = rp;
    this.resourceId = '';
    this.resourceIdInput = '';
    this.ensureIdForMode();
    this.persistAndReflect();
    this.pushMetadata();
    // Diagnostics (dev): log resource change + target schemas URL (best-effort)
    try {
      const pathAll = `${this.resourcePath.replace(/\/$/, '')}/all`;
      let base = '';
      try { base = (this.crud as any)?.getSchemasFilteredBaseUrl?.() || ''; } catch {}
      const url = base ? `${base}?path=${encodeURIComponent(pathAll)}&operation=get&schemaType=response&includeInternalSchemas=false` : '';
      this.log('resource changed', { resourcePath: this.resourcePath, demoFormId: this.demoFormId, schemasFiltered: url || '(base unavailable)' });
    } catch {}
    // Fully remount the DynamicForm to guarantee fresh schema/config for the new resource.
    this.remountForm();
    // Synchronize resource meta (title/desc/icon) if possible
    try {
      const match = this.resources.find(r => this.normalize(r.path) === rp);
      if (match) {
        this.bridge.setResourceMeta({ title: match.title, description: match.description, icon: match.icon });
      }
    } catch {}
    // Rebind async select to the new resource
    this.configureRecordSelect(true);
  }
  onResourceSelectionChange(ev: any): void {
    const r = ev?.value;
    if (!r) return;
    this.selectedResource = r;
    this.applyResource(r.path);
    try { this.bridge.setResourceMeta({ title: r.title, description: r.description, icon: r.icon }); } catch {}
    this.selectionConfirmed = true;
    setTimeout(() => (this.selectionConfirmed = false), 1200);
    this.triggerFade();
  }

  selectResource(r: any): void {
    if (!r) return;
    this.selectedResource = r;
    this.applyResource(r.path);
    this.triggerFade();
  }
  private triggerFade(): void { this.fadeOn = false; setTimeout(() => (this.fadeOn = true), 0); setTimeout(() => (this.fadeOn = false), 180); }
  refreshSample(): void { this.resourceId = ''; this.ensureIdForMode(true); }

  applyIdFromInput(): void {
    const id = (this.resourceIdInput || '').toString().trim();
    if (!id) { this.status('Informe um ID válido.'); return; }
    this.resourceId = id;
    this.persistAndReflect();
    this.status(`Carregado registro #${id}.`);
    this.pushMetadata();
    this.log('id applied from input', { id: this.resourceId, resourcePath: this.resourcePath, mode: this.mode });
  }

  copyLink(): void {
    const url = this.buildShareUrl();
    try { navigator.clipboard?.writeText(url); this.status(`Link copiado!`); }
    catch { this.status(`URL: ${url}`); }
  }

  onFormReady(_ev: any): void { this.status('Form pronto.'); this.pushMetadata(); }
  onSchemaStatusChange(ev: any): void { this.log('schema status', ev || {}); this.pushMetadata(); }
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

  discovering = false;
  private ensureIdForMode(force = false): void {
    if (this.mode === 'create') { return; }
    // Prefer the async select to drive selection when available
    if (this.recordSelect) { return; }
    if (!force && this.resourceId) { return; }
    if (this.discovering) { return; }
    this.discovering = true;
    this.status('Buscando registro de exemplo…');
    this.log('discover sample:start', { resourcePath: this.resourcePath, mode: this.mode });
    // Usa GenericCrudService para centralizar base, headers e erros.
    const svc: any = (this.crud as any)?.configure?.(this.resourcePath);
    // Preferir filtro paginado para payload leve. Se o backend não suportar, GenericCrudService lida com fallback.
    const obs = svc?.filter
      ? svc.filter({}, { pageNumber: 0, pageSize: 5, sort: ['id,desc'] })
      : (typeof svc?.getAll === 'function' ? svc.getAll() : null);
    if (!obs || typeof (obs as any)?.subscribe !== 'function') {
      this.discovering = false;
      this.log('discover sample:skip', { resourcePath: this.resourcePath, reason: 'service/observable unavailable' });
      return;
    }
    (obs as any).subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : (Array.isArray((data as any)?.content) ? (data as any).content : []);
        const item = Array.isArray(list) && list.length ? this.pickSample(list) : null;
        const id = this.extractId(item);
        if (id != null) {
          this.resourceId = String(id);
          this.resourceIdInput = String(id);
          this.persistAndReflect();
          this.status(`Usando registro #${this.resourceId} para demonstração.`);
          this.pushMetadata();
          this.log('discover sample:ok', { id: this.resourceId, resourcePath: this.resourcePath });
        } else {
          this.status('Não foi possível identificar o ID do primeiro registro.');
          this.log('discover sample:missing-id', { resourcePath: this.resourcePath });
        }
      },
      error: () => {
        this.status('Falha ao buscar registros para demonstração.');
        this.log('discover sample:error', { resourcePath: this.resourcePath });
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

  private lastPicked: Record<string, string> = {};
  private pickSample(list: any[]): any {
    const rp = this.resourcePath;
    const prev = this.lastPicked[rp] || '';
    // tenta achar um item com id diferente do anterior
    for (const it of list) {
      const id = this.extractId(it);
      if (id != null && String(id) !== prev) {
        this.lastPicked[rp] = String(id);
        return it;
      }
    }
    // fallback: primeiro
    const first = list[0];
    const fid = this.extractId(first);
    if (fid != null) this.lastPicked[rp] = String(fid);
    return first;
  }

  // Resources catalog
  private loadResources(): void {
    this.http.get<{ path: string; title: string; description: string; icon?: string }[]>(`/assets/resources.json`).subscribe({
      next: (list) => {
        this.resources = Array.isArray(list) ? list.slice(0, 30).map(r => ({ ...r, displayName: r.title })) : [];
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
  private remountForm(): void {
    try {
      this.formAlive = false;
      setTimeout(() => {
        this.formAlive = true;
      }, 0);
    } catch {}
  }
  private normalize(p: string): string { let x = (p||'').trim(); if (!x.startsWith('/')) x = '/' + x; return x.replace(/\/$/, ''); }
  private normalizeMode(m: string): FormMode { const v = (m||'').toLowerCase(); return v==='edit'||v==='view' ? v : 'create'; }
  private status(msg: string): void { this.statusMessage = msg; setTimeout(() => { if (this.statusMessage === msg) this.statusMessage = ''; }, 2000); }
  private log(message: string, data?: any): void { try { if (this.DEBUG) console.debug('[FormDemo]', message, data ?? ''); } catch {} }
  mapModule(path: string): string {
    try {
      const seg = (path || '').split('/').filter(Boolean)[0] || '';
      switch (seg) {
        case 'human-resources': return 'Módulo: Recursos Humanos';
        default: return '';
      }
    } catch { return ''; }
  }

  // Stable per-resource formId for config persistence and init gate
  get demoFormId(): string {
    const norm = this.resourcePath.replace(/^\//, '').replace(/[^\w-]+/g, '_');
    return `form-demo:${norm}`;
  }

  // Record selector (async select) wiring
  private configureRecordSelect(reload = false): void {
    if (!this.recordSelect) return;
    if (this.mode === 'create') return;
    const rp = (this.resourcePath || '').replace(/^\//, '');
    const meta: any = {
      name: 'demo-record',
      label: 'Selecionar registro',
      controlType: 'async-select',
      resourcePath: rp,
      searchable: true,
      loadOn: 'init',
    };
    try {
      this.recordSelect.setSelectMetadata(meta);
      if (reload) {
        this.recordSelect.reload(true);
        this.schedulePreselectFirst();
      } else {
        this.schedulePreselectFirst();
      }
    } catch {}
  }
  onRecordOptionsLoaded(_opts: Array<{ label: string; value: any }>): void { this.schedulePreselectFirst(); }
  private schedulePreselectFirst(attempt = 0): void {
    try {
      if (this.mode === 'create') return;
      if (!this.recordSelect) return;
      if (this.resourceId) return; // keep current selection
      const opts = (this.recordSelect as any).options?.();
      if (Array.isArray(opts) && opts.length) {
        const first = opts[0];
        this.recordSelect.selectOption(first as any);
        const v = (first as any).value;
        const id = v?.id ?? v;
        if (id != null) {
          this.resourceId = String(id);
          this.resourceIdInput = String(id);
          this.persistAndReflect();
          this.pushMetadata();
          this.log('record preselected', { id: this.resourceId, resourcePath: this.resourcePath });
        }
        return;
      }
      if (attempt < 10) setTimeout(() => this.schedulePreselectFirst(attempt + 1), 150);
    } catch {}
  }
  onRecordSelectionChange(val: any): void {
    try {
      const v = Array.isArray(val) ? (val[0] ?? null) : val;
      const id = v?.id ?? v;
      if (id == null || id === '') return;
      this.resourceId = String(id);
      this.resourceIdInput = String(id);
      this.persistAndReflect();
      this.pushMetadata();
      this.log('record selected', { id: this.resourceId, resourcePath: this.resourcePath });
    } catch {}
  }

}
