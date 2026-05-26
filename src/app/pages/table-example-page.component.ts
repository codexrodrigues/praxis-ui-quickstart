import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PraxisTable } from '@praxisui/table';
import { CustomizationModeService } from '../customization-mode.service';
import {
  QUICKSTART_RESOURCE_PATH,
  TABLE_CONFIG,
  TABLE_ACTIONS_SNIPPET,
  TABLE_DYNAMIC_FILTERS_CONFIG,
  TABLE_FILTERS_SNIPPET,
  TABLE_RELATED_SURFACES_CONFIG,
  TABLE_SNIPPET,
} from '../quickstart-content';
import { QuickstartSurfaceOpenService } from '../quickstart-surface-open.service';

@Component({
  selector: 'app-table-example-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, PraxisTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="example-page">
      <a class="back-link" routerLink="/">Back to home</a>

      <header class="page-header">
        <div>
          <p class="eyebrow">Praxis Table</p>
          <h1>Metadata-driven table with a remote contract</h1>
        </div>
        <mat-icon>table_rows</mat-icon>
      </header>

      <div class="page-grid">
        <article class="panel panel--snippet">
          <h2>Configured snippet</h2>
          <pre><code>{{ snippet }}</code></pre>
        </article>

        <article class="panel example-stage">
          <div class="stage-header">
            <div>
              <p class="stage-step">Baseline</p>
              <h2>Live example</h2>
            </div>
            <span>resourcePath + tableConfig</span>
          </div>
          <p class="stage-copy">
            A small host config selects the core business columns, avatar renderer, date formatting, and
            server-side table behavior while the rows still come from the published resource.
          </p>
          <div class="runtime-panel runtime-panel--wide">
            <div class="runtime-shell runtime-shell--table runtime-shell--table-compact">
                <praxis-table
                  tableId="quickstart-table"
                  [resourcePath]="resourcePath"
                  [config]="tableConfig"
                  [enableCustomization]="customizationEnabled()"
                />
            </div>
          </div>
        </article>

        <article class="panel example-stage">
          <div class="stage-header">
            <div>
              <p class="stage-step">Evolution 1</p>
              <h2>Dynamic filters</h2>
            </div>
            <span>FilterDTO + server strategy</span>
          </div>
          <p class="stage-copy">
            The table keeps the same resource contract and promotes dynamic filter UI from the
            backend metadata instead of hardcoding a local search form.
          </p>
          <pre><code>{{ filtersSnippet }}</code></pre>
          <div class="runtime-panel runtime-panel--wide">
            <div class="runtime-shell runtime-shell--table">
              <praxis-table
                tableId="quickstart-table-filters"
                [resourcePath]="resourcePath"
                [config]="tableFiltersConfig"
                [enableCustomization]="customizationEnabled()"
              />
            </div>
          </div>
        </article>

        <article class="panel example-stage">
          <div class="stage-header">
            <div>
              <p class="stage-step">Evolution 2</p>
              <h2>Related surfaces and row actions</h2>
            </div>
            <span>surfaces + actions + capabilities</span>
          </div>
          <p class="stage-copy">
            Row actions model three surface paths: a backend-published 360 profile opened by the
            Praxis adapter, payroll analytics rendered from declarative chart config, and a mission
            relation rendered with Praxis Table while the backend relation is not yet published.
          </p>
          <pre><code>{{ actionsSnippet }}</code></pre>
          <div class="runtime-panel runtime-panel--wide">
            <div class="runtime-shell runtime-shell--table">
              <praxis-table
                tableId="quickstart-table-surfaces-icons"
                componentInstanceId="quickstart-table-surfaces-icons"
                [resourcePath]="resourcePath"
                [config]="tableActionsConfig"
                [enableCustomization]="customizationEnabled()"
                (rowAction)="onRelatedSurfaceRowAction($event)"
              />
            </div>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [`
    .example-page { display:grid; gap:20px; min-width:0; }
    .back-link { color:var(--qs-example-link); text-decoration:underline; width:max-content; }
    .eyebrow { margin:0 0 8px; color:var(--qs-example-eyebrow); text-transform:uppercase; letter-spacing:.08em; font-size:.85rem; }
    .page-header { display:flex; justify-content:space-between; gap:18px; align-items:flex-start; }
    .page-header h1, .panel h2 { margin:0; }
    .page-header h1, .panel h2 { font-family:var(--font-display); color:var(--qs-example-title); }
    .page-grid { display:grid; gap:20px; min-width:0; }
    .panel { border:1px solid var(--qs-example-panel-border); padding:18px; background:var(--qs-example-panel-bg); box-shadow:var(--qs-example-panel-shadow); min-width:0; overflow:hidden; }
    .panel--snippet { max-width:920px; }
    .example-stage { display:grid; gap:14px; }
    .stage-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
    .stage-header span { border:1px solid var(--qs-example-panel-border); color:var(--qs-example-muted); padding:5px 8px; font-size:.78rem; white-space:nowrap; }
    .stage-step { margin:0 0 4px; color:var(--qs-example-eyebrow); text-transform:uppercase; letter-spacing:.08em; font-size:.78rem; font-weight:700; }
    .stage-copy { margin:0; color:var(--qs-example-muted); max-width:820px; line-height:1.55; }
    pre { margin:12px 0 0; padding:16px; overflow:auto; background:var(--qs-example-code-bg); color:var(--qs-example-code-text); }
    .runtime-panel { margin-top:12px; max-width:100%; overflow-x:auto; overflow-y:hidden; }
    .runtime-panel--wide { border-top:1px dashed var(--qs-example-divider); padding-top:14px; }
    .runtime-shell { min-width:max-content; }
    .runtime-shell--table { min-width:980px; }
    .runtime-shell--table-compact { min-width:540px; }
    .runtime-shell > praxis-table { display:block; }

    @media (max-width: 720px) {
      .stage-header { display:grid; }
      .stage-header span { white-space:normal; width:max-content; max-width:100%; }
      .runtime-shell--table { min-width:820px; }
      .runtime-shell--table-compact { min-width:540px; }
    }
  `],
})
export class TableExamplePageComponent {
  private readonly customizationMode = inject(CustomizationModeService);
  private readonly surfaceOpen = inject(QuickstartSurfaceOpenService);

  protected readonly snippet = TABLE_SNIPPET;
  protected readonly filtersSnippet = TABLE_FILTERS_SNIPPET;
  protected readonly actionsSnippet = TABLE_ACTIONS_SNIPPET;
  protected readonly resourcePath = QUICKSTART_RESOURCE_PATH;
  protected readonly tableConfig = TABLE_CONFIG;
  protected readonly tableFiltersConfig = TABLE_DYNAMIC_FILTERS_CONFIG;
  protected readonly tableActionsConfig = TABLE_RELATED_SURFACES_CONFIG;
  protected readonly customizationEnabled = this.customizationMode.customizationEnabled;

  protected onRelatedSurfaceRowAction(event: { action?: string; row?: Record<string, unknown> }): void {
    if (event.action !== 'hero-profile' || !event.row) {
      return;
    }

    void this.surfaceOpen.openBackendSurfaceFromRow({
      row: event.row,
      resourcePath: QUICKSTART_RESOURCE_PATH,
      surfaceId: 'hero-profile',
      title: `Perfil 360 de ${event.row['nomeCompleto'] || 'funcionario'}`,
      subtitle: 'Backend READ_PROJECTION opened through the Praxis surface adapter.',
      icon: 'person',
      size: { width: '760px', maxWidth: 'calc(100vw - 32px)', height: '82vh' },
    });
  }
}
