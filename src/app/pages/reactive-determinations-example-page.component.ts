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
type AuthenticationState = 'checking' | 'authenticated' | 'authentication-required' | 'error';

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

      <article class="panel authentication-panel" [attr.data-state]="authenticationState()">
        <div>
          <p class="stage-step">Host authentication</p>
          <h2>{{ authenticationTitle() }}</h2>
          <p>{{ authenticationDescription() }}</p>
        </div>
        @if (authenticationState() !== 'authenticated') {
          <form class="authentication-form" (submit)="login($event, username.value, password.value)">
            <label>
              Username
              <input #username name="username" autocomplete="username" required />
            </label>
            <label>
              Password
              <input #password name="password" type="password" autocomplete="current-password" required />
            </label>
            <button type="submit" [disabled]="authenticationPending()">Connect authorized host</button>
          </form>
          <p class="authentication-hint">
            The public host does not publish credentials. When running the downloaded Quickstart,
            use the business principal configured by your API or replace this demo login with your IdP/BFF.
          </p>
        } @else {
          <button type="button" class="secondary-action" (click)="logout()">End demo session</button>
        }
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
          <fieldset class="form-auth-boundary" [disabled]="authenticationState() !== 'authenticated'">
            <legend class="visually-hidden">Authenticated address form</legend>
            <praxis-dynamic-form
              formId="quickstart-reactive-address"
              [resourcePath]="addressResource"
              [schemaUrl]="addressSchemaUrl"
              submitUrl="/api/human-resources/enderecos"
              submitMethod="POST"
              mode="create"
              configPersistenceStrategy="input-first"
              [disabledModeGlobal]="authenticationState() !== 'authenticated'"
              (reactiveDeterminationExecuted)="record('address', $event)"
              (reactiveDeterminationPendingChange)="setPending('address', $event)"
            />
          </fieldset>
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
          <fieldset class="form-auth-boundary" [disabled]="authenticationState() !== 'authenticated'">
            <legend class="visually-hidden">Authenticated payroll form</legend>
            <praxis-dynamic-form
              formId="quickstart-reactive-payroll"
              [resourcePath]="payrollResource"
              [schemaUrl]="payrollSchemaUrl"
              submitUrl="/api/human-resources/folhas-pagamento"
              submitMethod="POST"
              mode="create"
              configPersistenceStrategy="input-first"
              [disabledModeGlobal]="authenticationState() !== 'authenticated'"
              (reactiveDeterminationExecuted)="record('payroll', $event)"
              (reactiveDeterminationPendingChange)="setPending('payroll', $event)"
            />
          </fieldset>
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

      <article class="panel troubleshooting-panel">
        <h2>Expected success and explicit negative paths</h2>
        <dl>
          <dt><code>401/403</code></dt>
          <dd>The host has no authorized business principal. Authenticate through the host boundary.</dd>
          <dt><code>422</code></dt>
          <dd>The source value is syntactically valid but the backend cannot determine an authoritative result.</dd>
          <dt><code>503</code></dt>
          <dd>The governed decision or its active Config snapshot is unavailable. The form remains unsatisfied.</dd>
        </dl>
        <p>
          A successful address run fills the owned address fields. A successful payroll run fills
          net salary first and payment date second. Neither path requires the Angular host to know the formula.
        </p>
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
    .authentication-panel { display:grid; gap:16px; }
    .authentication-form { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto; gap:12px; align-items:end; }
    .authentication-form label { display:grid; gap:6px; color:var(--qs-example-body); font-weight:600; }
    .authentication-form input { min-height:42px; padding:8px 10px; border:1px solid var(--qs-example-panel-border); background:var(--qs-example-panel-bg); color:var(--qs-example-title); }
    .authentication-form button,.secondary-action { min-height:42px; padding:8px 14px; }
    .authentication-hint { margin:0; font-size:.9rem; }
    .form-auth-boundary { min-width:0; margin:0; padding:0; border:0; }
    .form-auth-boundary:disabled { opacity:.78; }
    .visually-hidden { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
    .example-grid,.diagnostics-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px; align-items:start; }
    .panel-heading { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; }
    .state { border-radius:999px; padding:6px 10px; background:var(--md-sys-color-surface-container); font-size:.8rem; font-weight:700; }
    .state[data-state='loading'],.state[data-state='pending'] { background:var(--md-sys-color-secondary-container); }
    .state[data-state='unavailable'],.state[data-state='unsatisfied'] { background:var(--md-sys-color-error-container); }
    .notice { padding:14px 16px; border-radius:10px; }
    .notice--error { color:var(--md-sys-color-on-error-container); background:var(--md-sys-color-error-container); }
    .event-ledger { display:grid; gap:8px; padding-left:22px; }
    .event-ledger li { display:flex; flex-wrap:wrap; gap:8px 12px; }
    .troubleshooting-panel dl { display:grid; grid-template-columns:auto minmax(0,1fr); gap:8px 14px; }
    .troubleshooting-panel dt { font-weight:700; }
    .troubleshooting-panel dd { margin:0; color:var(--qs-example-body); }
    @media (max-width:900px) { .example-grid,.diagnostics-grid { grid-template-columns:1fr; } }
    @media (max-width:700px) { .authentication-form { grid-template-columns:1fr; } }
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
  protected readonly authenticationState = signal<AuthenticationState>('checking');
  protected readonly authenticationPending = signal(false);
  protected readonly pending = signal<Record<ExampleSurface, boolean>>({ address: false, payroll: false });
  protected readonly entries = signal<readonly SafeExecutionEntry[]>([]);
  protected readonly addressEvents = computed(() => this.eventsFor('address'));
  protected readonly payrollEvents = computed(() => this.eventsFor('payroll'));
  protected readonly recentEvents = computed(() => this.entries().slice(-10).reverse());

  constructor() {
    forkJoin({
      address: this.http.get<unknown>(new URL(ADDRESS_SCHEMA, this.apiOrigin).toString()),
      payroll: this.http.get<unknown>(new URL(PAYROLL_SCHEMA, this.apiOrigin).toString()),
    }).subscribe({
      next: ({ address, payroll }) => {
        this.addressSchema.set(address);
        this.payrollSchema.set(payroll);
        this.schemaState.set('ready');
      },
      error: () => this.schemaState.set('error'),
    });
    this.probeSession();
  }

  protected authenticationTitle(): string {
    switch (this.authenticationState()) {
      case 'authenticated': return 'Business principal connected';
      case 'checking': return 'Checking the host session';
      case 'error': return 'The authentication service is unavailable';
      default: return 'Authentication required for live determinations';
    }
  }

  protected authenticationDescription(): string {
    return this.authenticationState() === 'authenticated'
      ? 'The forms can now call the side-effect-free business capabilities. Final submit remains a separate protected command.'
      : 'Metadata is public, but business evaluations run under the host principal. This keeps the public example aligned with corporate authorization boundaries.';
  }

  protected login(event: Event, username: string, password: string): void {
    event.preventDefault();
    if (!username.trim() || !password || this.authenticationPending()) return;
    this.authenticationPending.set(true);
    this.http.post<void>(`${this.apiOrigin}/auth/login`, { username: username.trim(), password }, {
      withCredentials: true,
    }).subscribe({
      next: () => {
        this.authenticationPending.set(false);
        this.authenticationState.set('authenticated');
      },
      error: () => {
        this.authenticationPending.set(false);
        this.authenticationState.set('authentication-required');
      },
    });
  }

  protected logout(): void {
    this.authenticationPending.set(true);
    this.http.post<void>(`${this.apiOrigin}/auth/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout(),
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
    if (this.schemaState() === 'loading' || this.authenticationState() === 'checking') return 'loading';
    if (this.schemaState() === 'error') return 'unavailable';
    if (this.authenticationState() !== 'authenticated') return 'unavailable';
    if (this.pending()[surface]) return 'pending';
    const latest = [...this.eventsFor(surface)].reverse().find((event) => event.status !== 'pending');
    if (!latest) return 'ready';
    return latest.status === 'success' ? 'satisfied' : 'unsatisfied';
  }

  private eventsFor(surface: ExampleSurface): readonly ReactiveDeterminationExecutionEvent[] {
    return this.entries().filter((entry) => entry.surface === surface).map((entry) => entry.event);
  }

  private readonly apiOrigin = new URL(
    this.apiUrl['default']?.baseUrl ?? '/',
    globalThis.location.origin,
  ).origin;

  private probeSession(): void {
    this.http.get(`${this.apiOrigin}/auth/session`, { withCredentials: true }).subscribe({
      next: () => this.authenticationState.set('authenticated'),
      error: (error: { status?: number }) => this.authenticationState.set(
        error?.status === 401 ? 'authentication-required' : 'error',
      ),
    });
  }

  private finishLogout(): void {
    this.authenticationPending.set(false);
    this.authenticationState.set('authentication-required');
  }
}
