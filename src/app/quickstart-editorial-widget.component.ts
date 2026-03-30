import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  EditorialFormRuntimeComponent,
  type EditorialRuntimeHostConfig,
  type EditorialRuntimeInput,
} from '@praxisui/editorial-forms';

@Component({
  selector: 'app-quickstart-editorial-widget',
  standalone: true,
  imports: [CommonModule, EditorialFormRuntimeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="editorial-widget-shell">
      <praxis-editorial-form-runtime
        [solution]="input().solution"
        [instance]="input().instance"
        [runtimeContext]="input().runtimeContext ?? null"
        [hostConfig]="hostConfig"
      />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-width: 0;
    }

    .editorial-widget-shell {
      min-width: 0;
    }

    .editorial-widget-shell ::ng-deep .editorial-runtime {
      padding: 0;
      background: transparent;
    }

    .editorial-widget-shell ::ng-deep .runtime-header,
    .editorial-widget-shell ::ng-deep .journey-card,
    .editorial-widget-shell ::ng-deep .diagnostics-panel,
    .editorial-widget-shell ::ng-deep .empty-state {
      border-radius: 18px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 255, 0.96));
    }
  `],
})
export class QuickstartEditorialWidgetComponent {
  readonly input = input.required<EditorialRuntimeInput>();

  protected readonly hostConfig: EditorialRuntimeHostConfig = {
    emitOperationalEvents: false,
    forwardAdapterOperationalEvents: false,
  };
}
