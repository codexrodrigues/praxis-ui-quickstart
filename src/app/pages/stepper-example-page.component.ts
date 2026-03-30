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
    .back-link { color:#173ea5; text-decoration:underline; width:max-content; }
    .eyebrow { margin:0 0 8px; color:#777; text-transform:uppercase; letter-spacing:.08em; font-size:.85rem; }
    .page-header { display:flex; justify-content:space-between; gap:18px; align-items:flex-start; }
    .page-header h1, .panel h2 { margin:0; }
    .page-header h1, .panel h2 { font-family:var(--font-display); color:#111; }
    .page-grid { display:grid; gap:20px; }
    .panel { border:1px solid #d9dfeb; padding:18px; background:#fff; }
    .panel--compact { display:grid; gap:12px; }
    .panel--wide { display:grid; gap:12px; }
    .panel ul { margin:0; padding-left:20px; color:#2f3747; display:grid; gap:8px; }
    pre { margin:0; padding:16px; overflow:auto; background:#142847; color:#eef4ff; }
    .runtime-panel { border-top:1px dashed #cad3e2; padding-top:16px; }
  `],
})
export class StepperExamplePageComponent {
  private readonly customizationMode = inject(CustomizationModeService);

  protected readonly snippet = STEPPER_SNIPPET;
  protected readonly stepperId = QUICKSTART_STEPPER_ID;
  protected readonly stepperConfig = STEPPER_CONFIG;
  protected readonly customizationEnabled = this.customizationMode.customizationEnabled;
}
