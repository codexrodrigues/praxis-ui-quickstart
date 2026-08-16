import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { API_URL, type ReactiveDeterminationExecutionEvent } from '@praxisui/core';
import { PraxisDynamicForm } from '@praxisui/dynamic-form';
import { ReactiveDeterminationDiagnosticsComponent } from '@praxisui/metadata-editor';
import { forkJoin } from 'rxjs';

const ADDRESS_RESOURCE = 'human-resources/enderecos';
const PAYROLL_RESOURCE = 'human-resources/folhas-pagamento';
const ADDRESS_SCHEMA =
  '/schemas/filtered?path=/api/human-resources/enderecos&operation=post&schemaType=request';
const PAYROLL_SCHEMA =
  '/schemas/filtered?path=/api/human-resources/folhas-pagamento&operation=post&schemaType=request';

type ExampleSurface = 'address' | 'payroll';

interface SafeExecutionEntry {
  readonly surface: ExampleSurface;
  readonly event: ReactiveDeterminationExecutionEvent;
}

@Component({
  selector: 'app-reactive-determinations-example-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    PraxisDynamicForm,
    ReactiveDeterminationDiagnosticsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="example-page">
      <a class="back-link" routerLink="/">Back to home</a>

      <header class="page-header">
        <div>
          <p class="eyebrow">Backend-owned form decisions</p>
          <h1>Reactive Determinations, from schema to a stable draft</h1>
          <p>
            The host renders the exact request schema. Metadata names the capability and bindings;
            the backend owns the decision; Praxis updates derived fields and blocks submit while the
            latest generation is pending or unsatisfied.
          </p>
        </div>
        <mat-icon>account_tree</mat-icon>
      </header>

      <article class="panel contract-panel">
        <h2>What this example proves</h2>
        <ol>
          <li><code>x-ui.reactiveDeterminations</code> comes only from the exact request schema.</li>
          <li>The host never authors a URL, callback, formula, or field patch.</li>
          <li>Derived outputs stay read-only while the backend determination owns them.</li>
          <li>Events contain metadata and correlation only—never form or response values.</li>
          <li>The editor projection is diagnostic and read-only; rule changes go through governed Config authoring.</li>
        </ol>
      </article>

      <article class="panel provider-panel" data-testid="governed-provider-handoff">
        <div class="provider-panel__heading">
          <div>
            <p class="stage-step">Governed implementation handoff</p>
            <h2>The snapshot selects executable host code</h2>
          </div>
          <span class="catalog-badge">Reference catalog · not active-state telemetry</span>
        </div>
        <p>
          Metadata publishes only the field graph. Config selects an immutable source version, and
          the backend resolves that exact identity to a registered provider. An unknown version or
          operation fails closed with <code>503</code>; it never falls back to a local formula.
        </p>
        <ol class="decision-trail" aria-label="Governed provider resolution flow">
          <li><span class="decision-trail__index">1</span><div><strong>Config head</strong><span>tenant, environment, source version</span></div></li>
          <li><span class="decision-trail__index">2</span><div><strong>Host registry</strong><span>rule key + version + operation</span></div></li>
          <li><span class="decision-trail__index">3</span><div><strong>Capability response</strong><span>result + auditable decisionVersion</span></div></li>
        </ol>
        <div class="policy-table-wrap">
          <table class="policy-table">
            <caption>Providers registered by this reference host</caption>
            <thead><tr><th scope="col">Determination</th><th scope="col">Version 1</th><th scope="col">Version 2</th></tr></thead>
            <tbody>
              <tr><th scope="row">Net salary</th><td>HALF_EVEN rounding</td><td>HALF_UP rounding</td></tr>
              <tr><th scope="row">Payment date</th><td>Fifth weekday</td><td>Seventh weekday</td></tr>
            </tbody>
          </table>
        </div>
        <section class="upgrade-scenario" aria-labelledby="upgrade-scenario-title">
          <h3 id="upgrade-scenario-title">What happens when a policy changes while a form is open?</h3>
          <ol>
            <li><strong>Preview under v1</strong><span>The form receives derived values and an auditable version.</span></li>
            <li><strong>Config activates v2</strong><span>The structural schema remains stable; the governed provider changes.</span></li>
            <li><strong>Submit revalidates</strong><span>A stale derived value is rejected with 409 so the host can refresh it safely.</span></li>
          </ol>
        </section>
        <p class="provider-note">
          The safe event ledger below contains correlation metadata only. Inspect the capability
          response to audit <code>decisionVersion</code>; business values are deliberately excluded
          from frontend observability events. Preview capabilities are separate HTTP requests, so
          only the final create/update command guarantees one aggregate for the complete chain.
        </p>
      </article>

      @if (schemaState() === 'error') {
        <p class="notice notice--error" role="alert">
          The published request schemas could not be loaded. The forms remain fail-closed and no
          local fallback rule is installed.
        </p>
      }

      <div class="example-grid">
        <article class="panel">
          <div class="panel-heading">
            <div>
              <p class="stage-step">One determination</p>
              <h2>Postal code → authoritative address</h2>
            </div>
            <span class="state" [attr.data-state]="stateFor('address')">
              {{ stateFor('address') }}
            </span>
          </div>
          <p>Change the postal code. The server determines the owned address fields.</p>
          <praxis-dynamic-form
            formId="quickstart-reactive-address"
            [resourcePath]="addressResource"
            [schemaUrl]="addressSchemaUrl"
            submitUrl="/api/human-resources/enderecos"
            submitMethod="POST"
            mode="create"
            configPersistenceStrategy="input-first"
            (reactiveDeterminationExecuted)="record('address', $event)"
            (reactiveDeterminationPendingChange)="setPending('address', $event)"
          />
        </article>

        <article class="panel">
          <div class="panel-heading">
            <div>
              <p class="stage-step">Chained determinations</p>
              <h2>Gross pay → net pay → payment date</h2>
            </div>
            <span class="state" [attr.data-state]="stateFor('payroll')">
              {{ stateFor('payroll') }}
            </span>
          </div>
          <p>The second determination waits for the authoritative output of the first.</p>
          <praxis-dynamic-form
            formId="quickstart-reactive-payroll"
            [resourcePath]="payrollResource"
            [schemaUrl]="payrollSchemaUrl"
            submitUrl="/api/human-resources/folhas-pagamento"
            submitMethod="POST"
            mode="create"
            configPersistenceStrategy="input-first"
            (reactiveDeterminationExecuted)="record('payroll', $event)"
            (reactiveDeterminationPendingChange)="setPending('payroll', $event)"
          />
        </article>
      </div>

      <section class="diagnostics-grid" aria-label="Read-only determination diagnostics">
        <praxis-reactive-determination-diagnostics
          [schema]="addressSchema()"
          [executionEvents]="addressEvents()"
        />
        <praxis-reactive-determination-diagnostics
          [schema]="payrollSchema()"
          [executionEvents]="payrollEvents()"
        />
      </section>

      <article class="panel">
        <h2>Safe host event ledger</h2>
        <p>Use these events for UX and observability. Business values are intentionally absent.</p>
        @if (recentEvents().length) {
          <ol class="event-ledger">
            @for (entry of recentEvents(); track entry.event.correlationId + entry.event.status) {
              <li>
                <strong>{{ entry.surface }}</strong>
                <code>{{ entry.event.determinationId }}</code>
                <span>{{ entry.event.status }}</span>
                @if (entry.event.reason) { <span>{{ entry.event.reason }}</span> }
              </li>
            }
          </ol>
        } @else {
          <p>No determination has run yet.</p>
        }
      </article>
    </section>
  `,
  styles: [`
    :host { display:block; min-width:0; }
    .example-page { display:grid; gap:20px; min-width:0; }
    .back-link { color:var(--qs-example-link); text-decoration:underline; width:max-content; }
    .eyebrow,.stage-step { margin:0 0 8px; color:var(--qs-example-eyebrow); text-transform:uppercase; letter-spacing:.08em; font-size:.8rem; font-weight:700; }
    .page-header { display:flex; justify-content:space-between; gap:18px; align-items:flex-start; }
    .page-header > div { display:grid; gap:10px; max-width:850px; }
    .page-header h1,.panel h2 { margin:0; font-family:var(--font-display); color:var(--qs-example-title); }
    .page-header p,.panel p,.panel li { color:var(--qs-example-body); line-height:1.55; }
    .panel { border:1px solid var(--qs-example-panel-border); padding:18px; background:var(--qs-example-panel-bg); box-shadow:var(--qs-example-panel-shadow); min-width:0; overflow:hidden; }
    .contract-panel ol { margin:12px 0 0; padding-left:22px; display:grid; gap:8px; }
    .provider-panel { display:grid; gap:16px; }
    .provider-panel > p { margin:0; }
    .provider-panel__heading { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
    .catalog-badge { padding:6px 10px; border-radius:999px; background:var(--md-sys-color-surface-container-high); color:var(--md-sys-color-on-surface-variant); font-size:.76rem; font-weight:700; white-space:nowrap; }
    .decision-trail { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; padding:0; margin:0; list-style:none; }
    .decision-trail li { display:flex; gap:10px; align-items:flex-start; padding:12px; background:var(--md-sys-color-surface-container-low); border-inline-start:3px solid var(--md-sys-color-primary); }
    .decision-trail__index { display:grid; place-items:center; flex:0 0 24px; min-height:24px; border-radius:50%; color:var(--md-sys-color-on-primary); background:var(--md-sys-color-primary); font-size:.75rem; font-weight:800; }
    .decision-trail div { display:grid; gap:3px; min-width:0; }
    .decision-trail span:not(.decision-trail__index) { color:var(--md-sys-color-on-surface-variant); font-size:.82rem; overflow-wrap:anywhere; }
    .policy-table-wrap { overflow-x:auto; }
    .policy-table { width:100%; border-collapse:collapse; color:var(--qs-example-body); }
    .policy-table caption { text-align:start; padding-block-end:8px; color:var(--qs-example-title); font-weight:700; }
    .policy-table th,.policy-table td { padding:10px 12px; text-align:start; border-block-end:1px solid var(--qs-example-panel-border); }
    .policy-table thead th { color:var(--md-sys-color-on-surface-variant); font-size:.78rem; text-transform:uppercase; letter-spacing:.04em; }
    .upgrade-scenario { display:grid; gap:10px; padding:14px; border:1px solid var(--qs-example-panel-border); background:var(--md-sys-color-surface-container-lowest); }
    .upgrade-scenario h3 { margin:0; color:var(--qs-example-title); font-family:var(--font-display); font-size:1rem; }
    .upgrade-scenario ol { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; margin:0; padding:0; list-style:none; counter-reset:upgrade-step; }
    .upgrade-scenario li { display:grid; gap:4px; min-width:0; counter-increment:upgrade-step; }
    .upgrade-scenario li::before { content:counter(upgrade-step); color:var(--md-sys-color-primary); font-size:.75rem; font-weight:800; }
    .upgrade-scenario span { color:var(--md-sys-color-on-surface-variant); font-size:.84rem; overflow-wrap:anywhere; }
    .panel .provider-note { padding:12px 14px; background:var(--md-sys-color-secondary-container); color:var(--md-sys-color-on-secondary-container); }
    .example-grid,.diagnostics-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px; align-items:start; }
    .panel-heading { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; }
    .state { border-radius:999px; padding:6px 10px; background:var(--md-sys-color-surface-container); font-size:.8rem; font-weight:700; }
    .state[data-state='loading'],.state[data-state='pending'] { background:var(--md-sys-color-secondary-container); }
    .state[data-state='unavailable'],.state[data-state='unsatisfied'] { background:var(--md-sys-color-error-container); }
    .notice { padding:14px 16px; border-radius:10px; }
    .notice--error { color:var(--md-sys-color-on-error-container); background:var(--md-sys-color-error-container); }
    .event-ledger { display:grid; gap:8px; padding-left:22px; }
    .event-ledger li { display:flex; flex-wrap:wrap; gap:8px 12px; }
    @media (max-width:900px) { .example-grid,.diagnostics-grid { grid-template-columns:1fr; } }
    @media (max-width:700px) {
      .provider-panel__heading { display:grid; }
      .catalog-badge { width:fit-content; white-space:normal; }
      .decision-trail,.upgrade-scenario ol { grid-template-columns:1fr; }
    }
    @media (max-width:600px) { .page-header > mat-icon { display:none; } }
  `],
})
export class ReactiveDeterminationsExamplePageComponent {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  protected readonly addressResource = ADDRESS_RESOURCE;
  protected readonly payrollResource = PAYROLL_RESOURCE;
  protected readonly addressSchemaUrl = ADDRESS_SCHEMA;
  protected readonly payrollSchemaUrl = PAYROLL_SCHEMA;
  protected readonly addressSchema = signal<unknown>(null);
  protected readonly payrollSchema = signal<unknown>(null);
  protected readonly schemaState = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly pending = signal<Record<ExampleSurface, boolean>>({ address: false, payroll: false });
  protected readonly entries = signal<readonly SafeExecutionEntry[]>([]);
  protected readonly addressEvents = computed(() => this.eventsFor('address'));
  protected readonly payrollEvents = computed(() => this.eventsFor('payroll'));
  protected readonly recentEvents = computed(() => this.entries().slice(-10).reverse());

  constructor() {
    const apiOrigin = new URL(
      this.apiUrl['default']?.baseUrl ?? '/',
      globalThis.location.origin,
    ).origin;

    forkJoin({
      address: this.http.get<unknown>(new URL(ADDRESS_SCHEMA, apiOrigin).toString()),
      payroll: this.http.get<unknown>(new URL(PAYROLL_SCHEMA, apiOrigin).toString()),
    }).subscribe({
      next: ({ address, payroll }) => {
        this.addressSchema.set(address);
        this.payrollSchema.set(payroll);
        this.schemaState.set('ready');
      },
      error: () => this.schemaState.set('error'),
    });
  }

  protected record(surface: ExampleSurface, event: ReactiveDeterminationExecutionEvent): void {
    this.entries.update((entries) => [...entries.slice(-49), { surface, event }]);
  }

  protected setPending(surface: ExampleSurface, pending: boolean): void {
    this.pending.update((state) => ({ ...state, [surface]: pending }));
  }

  protected stateFor(
    surface: ExampleSurface,
  ): 'loading' | 'unavailable' | 'ready' | 'pending' | 'satisfied' | 'unsatisfied' {
    if (this.schemaState() === 'loading') return 'loading';
    if (this.schemaState() === 'error') return 'unavailable';
    if (this.pending()[surface]) return 'pending';
    const latest = [...this.eventsFor(surface)].reverse().find((event) => event.status !== 'pending');
    if (!latest) return 'ready';
    return latest.status === 'success' ? 'satisfied' : 'unsatisfied';
  }

  private eventsFor(surface: ExampleSurface): readonly ReactiveDeterminationExecutionEvent[] {
    return this.entries().filter((entry) => entry.surface === surface).map((entry) => entry.event);
  }
}
