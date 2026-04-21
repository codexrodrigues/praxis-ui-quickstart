import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PraxisList } from '@praxisui/list';
import { CustomizationModeService } from '../customization-mode.service';
import {
  LIST_CONFIG,
  LIST_SNIPPET,
  QUICKSTART_LIST_ID,
} from '../quickstart-content';

@Component({
  selector: 'app-list-example-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, PraxisList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="example-page">
      <a class="back-link" routerLink="/">Back to home</a>

      <header class="page-header">
        <div>
          <p class="eyebrow">Praxis List</p>
          <h1>Readable employee rows from the same remote collection</h1>
        </div>
        <mat-icon>view_list</mat-icon>
      </header>

      <div class="page-grid">
        <article class="panel">
          <h2>Minimal snippet</h2>
          <pre><code>{{ snippet }}</code></pre>
        </article>

        <article class="panel">
          <h2>Live example</h2>
          <div class="runtime-panel">
            <praxis-list
              [listId]="listId"
              [config]="listConfig"
              [enableCustomization]="customizationEnabled()"
            />
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [`
    .example-page { display:grid; gap:20px; }
    .back-link { color:var(--qs-example-link); text-decoration:underline; width:max-content; }
    .eyebrow { margin:0 0 8px; color:var(--qs-example-eyebrow); text-transform:uppercase; letter-spacing:.08em; font-size:.85rem; }
    .page-header { display:flex; justify-content:space-between; gap:18px; align-items:flex-start; }
    .page-header h1, .panel h2 { margin:0; }
    .page-header h1, .panel h2 { font-family:var(--font-display); color:var(--qs-example-title); }
    .page-grid { display:grid; gap:20px; }
    .panel { border:1px solid var(--qs-example-panel-border); padding:18px; background:var(--qs-example-panel-bg); box-shadow:var(--qs-example-panel-shadow); }
    pre { margin:12px 0 0; padding:16px; overflow:auto; background:var(--qs-example-code-bg); color:var(--qs-example-code-text); }
    .runtime-panel { margin-top:12px; border-top:1px dashed var(--qs-example-divider); padding-top:14px; }
    .runtime-panel praxis-list {
      --p-list-item-stack-gap: 8px;
      --p-list-item-padding-y: 14px;
      --p-list-item-padding-x: 16px;
      --p-list-item-gap: 16px;
      --p-list-radius: 16px;
      --p-list-shadow: none;
    }
    .runtime-panel praxis-list .list-item-text {
      gap: 10px;
    }
  `],
})
export class ListExamplePageComponent {
  private readonly customizationMode = inject(CustomizationModeService);

  protected readonly snippet = LIST_SNIPPET;
  protected readonly listId = QUICKSTART_LIST_ID;
  protected readonly listConfig = LIST_CONFIG;
  protected readonly customizationEnabled = this.customizationMode.customizationEnabled;
}
