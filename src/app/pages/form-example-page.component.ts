import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PraxisDynamicForm } from '@praxisui/dynamic-form';
import { CustomizationModeService } from '../customization-mode.service';
import {
  FORM_SNIPPET,
  QUICKSTART_FORM_ID,
  QUICKSTART_RESOURCE_PATH,
} from '../quickstart-content';

@Component({
  selector: 'app-form-example-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, PraxisDynamicForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="example-page">
      <a class="back-link" routerLink="/">Back to home</a>

      <header class="page-header">
        <div>
          <p class="eyebrow">Praxis Dynamic Form</p>
          <h1>Remote form for create flows</h1>
        </div>
        <mat-icon>edit_note</mat-icon>
      </header>

      <div class="page-grid">
        <article class="panel">
          <h2>Minimal snippet</h2>
          <pre><code>{{ snippet }}</code></pre>
        </article>

        <article class="panel">
          <h2>Live example</h2>
          <div class="runtime-panel">
            <praxis-dynamic-form
              [formId]="formId"
              [resourcePath]="resourcePath"
              mode="create"
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
  `],
})
export class FormExamplePageComponent {
  private readonly customizationMode = inject(CustomizationModeService);

  protected readonly snippet = FORM_SNIPPET;
  protected readonly formId = QUICKSTART_FORM_ID;
  protected readonly resourcePath = QUICKSTART_RESOURCE_PATH;
  protected readonly customizationEnabled = this.customizationMode.customizationEnabled;
}
