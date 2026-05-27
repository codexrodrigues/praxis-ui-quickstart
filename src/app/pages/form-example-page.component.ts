import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PraxisDynamicForm } from '@praxisui/dynamic-form';
import { CustomizationModeService } from '../customization-mode.service';
import {
  FORM_SNIPPET,
  QUICKSTART_FORM_ID,
  QUICKSTART_FORM_RESOURCE_ID,
  QUICKSTART_RESOURCE_PATH,
} from '../quickstart-content';

type FormDataMode = 'view' | 'edit' | 'create';
type FormDemoMode = FormDataMode | 'presentation';

interface FormDemoModeOption {
  readonly mode: FormDemoMode;
  readonly label: string;
  readonly icon: string;
  readonly description: string;
}

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
          <h1>Remote employee profile form</h1>
        </div>
        <mat-icon>edit_note</mat-icon>
      </header>

      <div class="page-grid">
        <article class="panel">
          <h2>Minimal snippet</h2>
          <pre><code>{{ snippet }}</code></pre>
        </article>

        <article class="panel">
          <div class="live-header">
            <div>
              <p class="stage-step">Runtime modes</p>
              <h2>Live example</h2>
            </div>
            <div class="mode-switcher" aria-label="Switch form runtime mode">
              @for (option of modeOptions; track option.mode) {
                <button
                  type="button"
                  class="mode-button"
                  [class.is-active]="selectedMode() === option.mode"
                  [attr.aria-pressed]="selectedMode() === option.mode"
                  [attr.title]="option.description"
                  (click)="selectMode(option.mode)"
                >
                  <mat-icon>{{ option.icon }}</mat-icon>
                  <span>{{ option.label }}</span>
                </button>
              }
            </div>
          </div>
          <p class="stage-copy">{{ selectedModeOption().description }}</p>
          <div class="runtime-panel">
            <praxis-dynamic-form
              [formId]="formId"
              [resourcePath]="resourcePath"
              [resourceId]="selectedResourceId()"
              [mode]="selectedDataMode()"
              [presentationModeGlobal]="presentationModeEnabled()"
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
    .live-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
    .stage-step { margin:0 0 4px; color:var(--qs-example-eyebrow); text-transform:uppercase; letter-spacing:.08em; font-size:.78rem; font-weight:700; }
    .stage-copy { margin:12px 0 0; color:var(--qs-example-muted); max-width:760px; line-height:1.55; }
    .mode-switcher { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:8px; }
    .mode-button { display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:36px; padding:0 12px; border:1px solid var(--md-sys-color-outline-variant); border-radius:var(--qs-nav-pill-radius); background:var(--md-sys-color-surface-container-low); color:var(--md-sys-color-on-surface); box-shadow:var(--qs-nav-pill-shadow); font:inherit; font-weight:700; cursor:pointer; transition:background-color .18s ease, border-color .18s ease, color .18s ease, transform .18s ease; }
    .mode-button mat-icon { width:18px; height:18px; font-size:18px; }
    .mode-button:hover { border-color:var(--md-sys-color-primary); transform:translateY(-1px); }
    .mode-button:focus-visible { outline:2px solid var(--md-sys-color-primary); outline-offset:2px; }
    .mode-button.is-active { background:linear-gradient(135deg, var(--md-sys-color-primary), var(--md-sys-color-secondary)); color:var(--md-sys-color-on-primary); border-color:transparent; }
    .runtime-panel { margin-top:12px; border-top:1px dashed var(--qs-example-divider); padding-top:14px; }
    @media (max-width: 720px) {
      .live-header { display:grid; }
      .mode-switcher { justify-content:flex-start; }
      .mode-button { flex:1 1 96px; }
    }
  `],
})
export class FormExamplePageComponent {
  private readonly customizationMode = inject(CustomizationModeService);

  protected readonly modeOptions: readonly FormDemoModeOption[] = [
    {
      mode: 'view',
      label: 'View',
      icon: 'visibility',
      description: 'Read a remote employee profile with field presentation, avatar header, and read-only semantics.',
    },
    {
      mode: 'edit',
      label: 'Edit',
      icon: 'edit',
      description: 'Keep the same resource contract and switch the runtime into data editing mode.',
    },
    {
      mode: 'create',
      label: 'Create',
      icon: 'add_circle',
      description: 'Drop the resourceId and let the same metadata render an empty creation flow.',
    },
    {
      mode: 'presentation',
      label: 'Present',
      icon: 'preview',
      description: 'Keep the loaded employee in view mode and force presentation rendering for a clean read surface.',
    },
  ];
  protected readonly selectedMode = signal<FormDemoMode>('view');
  protected readonly snippet = FORM_SNIPPET;
  protected readonly formId = QUICKSTART_FORM_ID;
  protected readonly resourcePath = QUICKSTART_RESOURCE_PATH;
  protected readonly resourceId = QUICKSTART_FORM_RESOURCE_ID;
  protected readonly customizationEnabled = this.customizationMode.customizationEnabled;

  protected selectMode(mode: FormDemoMode): void {
    this.selectedMode.set(mode);
  }

  protected selectedModeOption(): FormDemoModeOption {
    return this.modeOptions.find((option) => option.mode === this.selectedMode()) ?? this.modeOptions[0];
  }

  protected selectedDataMode(): FormDataMode {
    const mode = this.selectedMode();
    return mode === 'presentation' ? 'view' : mode;
  }

  protected presentationModeEnabled(): boolean | null {
    return this.selectedMode() === 'presentation' ? true : null;
  }

  protected selectedResourceId(): number | undefined {
    return this.selectedMode() === 'create' ? undefined : this.resourceId;
  }
}
