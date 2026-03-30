import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PraxisCrudComponent } from '@praxisui/crud';
import { CustomizationModeService } from '../customization-mode.service';
import {
  CRUD_METADATA,
  CRUD_SNIPPET,
  QUICKSTART_CRUD_ID,
} from '../quickstart-content';

@Component({
  selector: 'app-crud-example-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, PraxisCrudComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="example-page">
      <a class="back-link" routerLink="/">Back to home</a>

      <header class="page-header">
        <div>
          <p class="eyebrow">Praxis CRUD</p>
          <h1>Listing and modal flow in a dedicated route</h1>
        </div>
        <mat-icon>inventory_2</mat-icon>
      </header>

      <div class="page-grid">
        <article class="panel">
          <h2>Minimal snippet</h2>
          <pre><code>{{ snippet }}</code></pre>
        </article>

        <article class="panel">
          <h2>Live example</h2>
          <div class="runtime-panel runtime-panel--wide">
            <div class="runtime-shell runtime-shell--crud">
              <praxis-crud
                [crudId]="crudId"
                [metadata]="crudMetadata"
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
    .runtime-shell--crud { min-width:980px; }
    .runtime-shell > praxis-crud { display:block; }

    @media (max-width: 720px) {
      .runtime-shell--crud { min-width:820px; }
    }
  `],
})
export class CrudExamplePageComponent {
  private readonly customizationMode = inject(CustomizationModeService);

  protected readonly snippet = CRUD_SNIPPET;
  protected readonly crudId = QUICKSTART_CRUD_ID;
  protected readonly crudMetadata = CRUD_METADATA;
  protected readonly customizationEnabled = this.customizationMode.customizationEnabled;
}
