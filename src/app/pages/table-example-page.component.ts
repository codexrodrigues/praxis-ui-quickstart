import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PraxisTable } from '@praxisui/table';
import { CustomizationModeService } from '../customization-mode.service';
import { QUICKSTART_RESOURCE_PATH, TABLE_SNIPPET } from '../quickstart-content';

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
        <article class="panel">
          <h2>Minimal snippet</h2>
          <pre><code>{{ snippet }}</code></pre>
        </article>

        <article class="panel">
          <h2>Live example</h2>
          <div class="runtime-panel runtime-panel--wide">
            <div class="runtime-shell runtime-shell--table">
                <praxis-table
                  tableId="quickstart-table"
                  [resourcePath]="resourcePath"
                  [enableCustomization]="customizationEnabled()"
                />
            </div>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [`
    .example-page { display:grid; gap:20px; min-width:0; }
    .back-link { color:#173ea5; text-decoration:underline; width:max-content; }
    .eyebrow { margin:0 0 8px; color:#777; text-transform:uppercase; letter-spacing:.08em; font-size:.85rem; }
    .page-header { display:flex; justify-content:space-between; gap:18px; align-items:flex-start; }
    .page-header h1, .panel h2 { margin:0; }
    .page-header h1, .panel h2 { font-family:var(--font-display); color:#111; }
    .page-grid { display:grid; gap:20px; min-width:0; }
    .panel { border:1px solid #d9dfeb; padding:18px; background:#fff; min-width:0; overflow:hidden; }
    pre { margin:12px 0 0; padding:16px; overflow:auto; background:#142847; color:#eef4ff; }
    .runtime-panel { margin-top:12px; max-width:100%; overflow-x:auto; overflow-y:hidden; }
    .runtime-panel--wide { border-top:1px dashed #cad3e2; padding-top:14px; }
    .runtime-shell { min-width:max-content; }
    .runtime-shell--table { min-width:980px; }
    .runtime-shell > praxis-table { display:block; }

    @media (max-width: 720px) {
      .runtime-shell--table { min-width:820px; }
    }
  `],
})
export class TableExamplePageComponent {
  private readonly customizationMode = inject(CustomizationModeService);

  protected readonly snippet = TABLE_SNIPPET;
  protected readonly resourcePath = QUICKSTART_RESOURCE_PATH;
  protected readonly customizationEnabled = this.customizationMode.customizationEnabled;
}
