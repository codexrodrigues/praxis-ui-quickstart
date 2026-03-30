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
    .back-link { color:#173ea5; text-decoration:underline; width:max-content; }
    .eyebrow { margin:0 0 8px; color:#777; text-transform:uppercase; letter-spacing:.08em; font-size:.85rem; }
    .page-header { display:flex; justify-content:space-between; gap:18px; align-items:flex-start; }
    .page-header h1, .panel h2 { margin:0; }
    .page-header h1, .panel h2 { font-family:var(--font-display); color:#111; }
    .page-grid { display:grid; gap:20px; }
    .panel { border:1px solid #d9dfeb; padding:18px; background:#fff; }
    pre { margin:12px 0 0; padding:16px; overflow:auto; background:#142847; color:#eef4ff; }
    .runtime-panel { margin-top:12px; border-top:1px dashed #cad3e2; padding-top:14px; }
    .runtime-panel praxis-list {
      --p-list-item-stack-gap: 32px;
      --p-list-item-padding-y: 18px;
      --p-list-item-padding-x: 18px;
      --p-list-item-gap: 16px;
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
