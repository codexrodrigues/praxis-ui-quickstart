import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PraxisStepper } from '@praxisui/stepper';
import { CustomizationModeService } from '../customization-mode.service';
import {
  QUICKSTART_STEPPER_ID,
  STEPPER_CONFIG,
  STEPPER_SNIPPET,
} from '../quickstart-content';

@Component({
  selector: 'app-stepper-example-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, PraxisStepper],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="example-page">
      <a class="back-link" routerLink="/">Back to home</a>

      <header class="page-header">
        <div>
          <p class="eyebrow">Praxis Stepper</p>
          <h1>Guide an employee onboarding flow with real forms already split into steps</h1>
        </div>
        <mat-icon>checklist</mat-icon>
      </header>

      <div class="page-grid">
        <article class="panel panel--compact">
          <h2>What you can do</h2>
          <ul>
            <li>Break one resource into smaller steps that feel easier to complete.</li>
            <li>Keep validation and navigation in place while each step stays focused.</li>
            <li>Adjust labels, order, and step behavior in the editor when the flow evolves.</li>
          </ul>
        </article>

        <article class="panel panel--compact">
          <h2>Minimal snippet</h2>
          <pre><code>{{ snippet }}</code></pre>
        </article>

        <article class="panel panel--wide">
          <h2>Live example</h2>
          <div class="runtime-panel">
            <praxis-stepper
              [stepperId]="stepperId"
              [config]="stepperConfig"
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
    .panel--compact { display:grid; gap:12px; }
    .panel--wide { display:grid; gap:12px; }
    .panel ul { margin:0; padding-left:20px; color:var(--qs-example-body); display:grid; gap:8px; }
    pre { margin:0; padding:16px; overflow:auto; background:var(--qs-example-code-bg); color:var(--qs-example-code-text); }
    .runtime-panel { border-top:1px dashed var(--qs-example-divider); padding-top:16px; }

    :host ::ng-deep .runtime-panel .mat-stepper-horizontal,
    :host ::ng-deep .runtime-panel .mat-stepper-vertical {
      border: 0 !important;
      border-radius: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
    }

    :host ::ng-deep .runtime-panel .mat-horizontal-content-container,
    :host ::ng-deep .runtime-panel .mat-vertical-content-container {
      padding: 12px 0 0 !important;
      border: 0 !important;
    }

    :host ::ng-deep .runtime-panel fieldset,
    :host ::ng-deep .runtime-panel .form-section,
    :host ::ng-deep .runtime-panel .section-card,
    :host ::ng-deep .runtime-panel .group-card {
      border-radius: 18px !important;
      box-shadow: none !important;
    }

    :host ::ng-deep .runtime-panel .mat-step-actions,
    :host ::ng-deep .runtime-panel [data-stepper-navigation],
    :host ::ng-deep .runtime-panel .stepper-actions,
    :host ::ng-deep .runtime-panel .navigation-actions {
      padding: 18px 0 0 !important;
      border: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
    }
  `],
})
export class StepperExamplePageComponent {
  private readonly customizationMode = inject(CustomizationModeService);

  protected readonly snippet = STEPPER_SNIPPET;
  protected readonly stepperId = QUICKSTART_STEPPER_ID;
  protected readonly stepperConfig = STEPPER_CONFIG;
  protected readonly customizationEnabled = this.customizationMode.customizationEnabled;
}
