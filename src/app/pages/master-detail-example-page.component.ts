import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CustomizationModeService } from '../customization-mode.service';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ASYNC_CONFIG_STORAGE, buildPageKey, CompositionValidatorService, ComponentMetadataRegistry, PRAXIS_DYNAMIC_PAGE_COMPONENT_METADATA, type WidgetPageDefinition } from '@praxisui/core';
import { DynamicPageBuilderComponent, preflightUiCompositionPlan, type UiCompositionPlan } from '@praxisui/page-builder';

@Component({
  standalone: true,
  imports: [RouterLink, DynamicPageBuilderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      <a routerLink="/">Back to home</a>
      <h1>Consulta de funcionários</h1>
      <p>Selecione um funcionário para consultar seus detalhes. Para limpar a seleção, foque o seletor marcado e pressione Espaço.</p>
      <p role="status">{{ persistenceStatus() }}</p>
      @if (error()) { <p role="alert">{{ error() }}</p> }
      @if (page(); as definition) {
        <praxis-dynamic-page-builder [page]="definition" [strictValidation]="true"
          [enableCustomization]="customization.customizationEnabled()" [enableAgenticAuthoring]="false" [autoPersist]="false"
          [pageIdentity]="identity" (pageAuthoringChange)="onAuthoringChange()" (pageSaveRequested)="save($event)" />
      } @else if (!error()) { <p role="status">Carregando composição…</p> }
    </section>
  `,
  styles: [`
    section { display: grid; gap: var(--qs-master-detail-gap, 16px); min-width: 0; }
    h1, p { margin: 0; color: var(--qs-example-title); }
    a { color: var(--qs-example-link); }
  `],
})
export class MasterDetailExamplePageComponent {
  readonly page = signal<WidgetPageDefinition | null>(null);
  readonly error = signal('');
  readonly customization = inject(CustomizationModeService);
  readonly identity = { appId: 'praxis-ui-quickstart', routePath: '/examples/master-detail' };
  readonly persistenceStatus = signal('Carregando configuração');
  private readonly storage = inject(ASYNC_CONFIG_STORAGE);
  private readonly validator = new CompositionValidatorService();
  private readonly key = `dynamic-page:${buildPageKey(this.identity)}`;
  private revision = 0;
  private saving = false;
  private readonly registry = inject(ComponentMetadataRegistry);

  constructor() {
    this.registry.register(PRAXIS_DYNAMIC_PAGE_COMPONENT_METADATA);
    inject(HttpClient).get<UiCompositionPlan>('recipes/master-detail.ui-composition-plan.json')
      .pipe(takeUntilDestroyed()).subscribe({
        next: async plan => {
          const result = preflightUiCompositionPlan(plan, this.registry);
          if (result.valid) {
            try {
              const stored = await firstValueFrom(this.storage.loadConfig<WidgetPageDefinition>(this.key));
              if (stored && !this.valid(stored)) throw new Error("Documento inválido");
              this.page.set(stored ?? result.page);
              this.persistenceStatus.set(stored ? "Página restaurada" : "Composição original");
            } catch { this.error.set("Não foi possível restaurar a configuração da página."); }
          }
          else this.error.set(result.diagnostics.map(d => `${d.code}: ${d.message}`).join(' · '));
        },
        error: () => this.error.set('Não foi possível carregar a composição de referência.'),
      });
  }
  onAuthoringChange(): void {
    this.revision++;
    this.persistenceStatus.set('Alterações não salvas');
  }

  private valid(page: WidgetPageDefinition): boolean {
    return !Object.hasOwn(page, 'connections') && !this.validator.validatePage(page, {
      registry: this.registry, links: page.composition?.links ?? [],
    }).some(d => d.blocking !== false && (d.severity === 'error' || d.severity === 'fatal'));
  }

  async save(next: WidgetPageDefinition): Promise<void> {
    if (this.saving) return;
    if (!this.valid(next)) { this.persistenceStatus.set('Página inválida; não salva'); return; }
    const revision = this.revision;
    const snapshot = structuredClone(next);
    this.saving = true;
    this.persistenceStatus.set('Salvando página');
    try {
      await firstValueFrom(this.storage.saveConfig(this.key, snapshot));
      const stored = await firstValueFrom(this.storage.loadConfig<WidgetPageDefinition>(this.key));
      if (!stored || !this.valid(stored)) throw new Error('Leitura inválida após salvar');
      if (this.revision === revision) this.page.set(stored);
      this.persistenceStatus.set(this.revision === revision ? 'Página salva' : 'Alterações não salvas');
    } catch { this.persistenceStatus.set('Falha ao salvar; alterações mantidas no editor'); }
    finally { this.saving = false; }
  }

}
