import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ValidatorFn } from '@angular/forms';
import { DynamicFormService, GenericCrudService, readStrongResourceEtag, type FieldMetadata, type FormPayloadPreviewEvent,
  type FormReadyEvent, type FormSubmitEvent, type FormValueChangeEvent } from '@praxisui/core';
import { PraxisDynamicForm } from '@praxisui/dynamic-form';
import { Subscription } from 'rxjs';
import { PayrollEventReader, type PayrollParentPrecondition } from './payroll-event-reader.service';

type CaptureState = 'loading' | 'ready' | 'capturing' | 'blocked' | 'conflict' | 'saved';
interface EventDraft extends Record<string, unknown> { descricao?: string; tipo?: string; valor?: number; folhaPagamentoId?: number; }
const EVENT_PATH = '/api/human-resources/eventos-folha';

/** The backend owns the exact parent set and CAS; this bridge only captures and preserves snapshots. */
@Component({
  selector: 'app-payroll-event-form-host', standalone: true,
  imports: [CommonModule, PraxisDynamicForm], providers: [PayrollEventReader, GenericCrudService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="payroll-event-heading">
      <h3 id="payroll-event-heading">{{ eventId == null ? 'Criar evento pendente' : 'Editar ou mover evento pendente' }}</h3>
      <p id="payroll-event-capture-status" role="status" aria-live="polite">{{ message() }}</p>
      @if (preservedDraft(); as draft) {
        <details><summary>Rascunho anterior preservado para comparação</summary>
          <dl><dt>Descrição</dt><dd>{{ draft.descricao }}</dd><dt>Tipo</dt><dd>{{ draft.tipo }}</dd>
            <dt>Valor informado (BRL)</dt><dd>{{ draft.valor }}</dd><dt>Folha</dt><dd>{{ draft.folhaPagamentoId }}</dd></dl>
        </details>
      }
      @if (mounted()) {
        <praxis-dynamic-form #eventForm
          [formId]="formId" [mode]="eventId == null ? 'create' : 'edit'"
          [resourceId]="eventId ?? undefined" [initialValue]="initialValue"
          [schemaUrl]="schemaUrl" [submitUrl]="submitUrl" [submitMethod]="eventId == null ? 'POST' : 'PUT'"
          [submitResourceVersion]="eventEtag" configPersistenceStrategy="input-first"
          [enableCustomization]="false" [showAiAssistant]="false" aria-describedby="payroll-event-capture-status"
          (formReady)="onFormReady($event)" (valueChange)="onValueChange($event)"
          (payloadPreviewChange)="onPayloadPreview($event)" (formSubmit)="onSubmit($event)" />
        @if (state() === 'blocked') {
          <button type="button" (click)="captureSelectedParent()">Capturar a folha selecionada</button>
        }
      }
      @if (state() === 'conflict' || (!mounted() && state() === 'blocked')) {
        <button type="button" (click)="reloadForReview()">Recarregar explicitamente para revisão</button>
      }
    </section>
  `,
  styles: [`
    :host { display:block; min-width:0; margin-top:12px; padding-top:14px; border-top:1px solid var(--qs-example-panel-border, rgba(128,128,128,.24)); }
    section { display:grid; gap:12px; min-width:0; }
    h3 { margin:0; font-family:var(--font-display); color:var(--qs-example-title); font-size:1.05rem; }
    p[role='status'] { margin:0; color:var(--qs-example-body); line-height:1.5; }
    details dl { display:grid; grid-template-columns:auto minmax(0,1fr); gap:6px 14px; margin:10px 0 0; }
    details dt { font-weight:700; }
    details dd { margin:0; color:var(--qs-example-body); }
    button { width:max-content; min-height:38px; padding:6px 14px; }
  `],
})
export class PayrollEventFormHostComponent implements OnChanges, OnDestroy {
  @Input() eventId: number | null = null;
  @Input() initialParentId: number | null = null;
  /** The owner changes this identity when session, tenant, environment or API scope changes. */
  @Input({ required: true }) operationalContext = '';
  @ViewChild('eventForm') eventForm?: PraxisDynamicForm;

  readonly state = signal<CaptureState>('loading');
  readonly mounted = signal(false);
  readonly message = signal('Aguardando o snapshot autorizado.');
  readonly preservedDraft = signal<EventDraft | null>(null);
  initialValue: EventDraft = {};
  eventEtag: string | undefined;
  formId = '';
  schemaUrl = '';
  submitUrl = '';

  private readonly reader = inject(PayrollEventReader);
  private readonly arrays = inject(DynamicFormService);
  private form?: FormGroup;
  private arrayMetadata?: FieldMetadata;
  private initialDraft: EventDraft = {};
  private origin?: PayrollParentPrecondition;
  private destination?: PayrollParentPrecondition;
  private initialCapture?: PayrollParentPrecondition;
  private selectedId: number | null = null;
  private hydrated = false;
  private serialized = false;
  private schemaAdmitted = false;
  private conflict = false;
  private generation = 0;
  private cycle = 0;
  private destroyed = false;
  private destinationRead?: Subscription;
  private eventRead?: Subscription;
  private serializeTimer?: ReturnType<typeof setTimeout>;
  private readonly captureValidator: ValidatorFn = (control: AbstractControl) =>
    this.form === control && this.schemaAdmitted && this.state() === 'ready' && !this.conflict && this.serialized
      && this.sameConditions(control.get('precondicoesFolhas')?.getRawValue(), this.expectedConditions())
      && this.parentId(control.get('folhaPagamentoId')?.value) === this.selectedId
      ? null : { payrollParentCapture: true };

  ngOnChanges(): void { this.startCycle(false); }
  ngOnDestroy(): void { this.destroyed = true; this.cancelReads(); this.detachForm(); }

  reloadForReview(): void { this.startCycle(true); }

  private startCycle(preserve: boolean): void {
    if (preserve) {
      if (!this.preservedDraft()) this.preservedDraft.set(this.safeDraft(this.form?.getRawValue() ?? this.initialDraft));
    } else this.preservedDraft.set(null);
    this.cancelReads(); this.detachForm(); this.mounted.set(false); this.cycle++;
    this.origin = this.destination = this.initialCapture = undefined;
    this.eventEtag = undefined; this.selectedId = null; this.hydrated = false;
    this.serialized = false; this.conflict = false;
    this.initialDraft = {}; this.initialValue = {};
    if (!this.operationalContext || (this.eventId != null && this.parentId(this.eventId) == null)) {
      this.setState('blocked', 'Contexto operacional ou identidade do evento indisponível.'); return;
    }
    this.formId = `quickstart-payroll-event-${this.eventId ?? 'create'}-${this.cycle}`;
    this.schemaUrl = `/schemas/filtered?path=${EVENT_PATH}${this.eventId == null ? '' : '/{id}'}&operation=${this.eventId == null ? 'post' : 'put'}&schemaType=request`;
    this.submitUrl = `${EVENT_PATH}${this.eventId == null ? '' : '/' + this.eventId}`;
    if (this.eventId == null) {
      this.initialDraft = this.initialParentId == null ? {} : { folhaPagamentoId: this.initialParentId };
      this.initialValue = { ...this.initialDraft };
      this.setState('blocked', 'Selecione uma folha; sua revisão deve ser capturada antes de confirmar.');
      this.mounted.set(true); return;
    }
    this.setState('loading', 'Carregando evento e precondição de origem no mesmo snapshot.');
    const cycle = this.cycle, id = this.eventId;
    this.eventRead = this.reader.events.getByIdHttpResponse(id).subscribe({
      next: (response) => {
        if (this.destroyed || cycle !== this.cycle || id !== this.eventId) return;
        const body = response.body?.data, etag = readStrongResourceEtag(response.headers.get('ETag'));
        const parent = body?.precondicaoFolhaAtual;
        if (!body || body.id !== id || !etag || body.status !== 'PENDENTE'
          || body.valor == null || this.parentId(body.folhaPagamentoId) == null
          || !parent || parent.folhaPagamentoId !== body.folhaPagamentoId
          || !readStrongResourceEtag(parent.resourceVersion)) {
          this.setState('blocked', 'O snapshot não permite edição segura. Recarregue para revisão.'); return;
        }
        this.origin = Object.freeze({ ...parent }); this.eventEtag = etag;
        this.initialDraft = this.safeDraft(body); this.initialValue = { ...this.initialDraft };
        this.setState('blocked', 'Preparando formulário a partir do snapshot capturado.');
        this.mounted.set(true);
      },
      error: () => this.setState('blocked', 'Não foi possível ler o evento autorizado. O editor permanece bloqueado.'),
    });
  }

  onFormReady(event: FormReadyEvent): void {
    const rebuilding = !!this.form;
    this.cancelDestination(); this.detachForm(); this.form = event.formGroup;
    this.arrayMetadata = event.fieldsMetadata.find((field) => field.name === 'precondicoesFolhas');
    this.hydrated = this.eventId == null;
    this.serialized = false; this.form.addValidators(this.captureValidator);
    if (!(this.form.get('precondicoesFolhas') instanceof FormArray)
      || this.arrayMetadata?.formHidden !== true
      || !this.arrayMetadata?.array?.itemSchema?.fields?.some((field) => field.name === 'folhaPagamentoId')
      || !this.arrayMetadata.array.itemSchema.fields.some((field) => field.name === 'resourceVersion')) {
      this.setState('blocked', 'O schema publicado não contém a lista tipada de transporte fora do layout.'); return;
    }
    this.schemaAdmitted = true;
    if (this.eventId == null) {
      this.selectedId = this.parentId(this.form.get('folhaPagamentoId')?.value);
      if (!rebuilding) this.initialDraft = this.safeDraft(this.form.getRawValue());
      if (!rebuilding && this.selectedId != null) this.captureSelectedParent();
      else this.restoreKnownCapture();
    }
    this.revalidate();
  }

  onValueChange(event: FormValueChangeEvent): void {
    if (!this.hydrated || !this.form || this.conflict) return;
    const id = this.parentId(event.formData?.folhaPagamentoId);
    if (id === this.selectedId) return;
    this.selectedId = id; this.destination = undefined; this.serialized = false;
    this.cancelDestination();
    if (this.origin?.folhaPagamentoId === id) this.restoreKnownCapture();
    else this.captureSelectedParent();
  }

  captureSelectedParent(): void {
    if (!this.form || !this.hydrated || this.conflict || !this.schemaAdmitted || !this.arrayMetadata?.array?.itemSchema?.fields) return;
    this.selectedId = this.parentId(this.form.get('folhaPagamentoId')?.value);
    if (this.selectedId == null) { this.setState('blocked', 'Selecione uma folha válida antes de confirmar.'); return; }
    if (this.origin?.folhaPagamentoId === this.selectedId) { this.restoreKnownCapture(); return; }
    this.cancelDestination(); this.destination = undefined; this.serialized = false;
    this.setState('capturing', 'Capturando a revisão da folha selecionada. A confirmação está bloqueada.');
    const generation = this.generation, cycle = this.cycle, id = this.selectedId, form = this.form;
    this.destinationRead = this.reader.payrolls.getByIdHttpResponse(id).subscribe({
      next: (response) => {
        if (generation !== this.generation || cycle !== this.cycle || this.destroyed || form !== this.form
          || id !== this.selectedId || id !== this.parentId(form.get('folhaPagamentoId')?.value)) return;
        const etag = readStrongResourceEtag(response.headers.get('ETag'));
        const payroll = response.body?.data;
        if (payroll?.id !== id || !etag || payroll.reconciliacao !== 'CONFIRMADA'
          || payroll.estado === 'PAGA' || payroll.dataPagamentoEfetiva != null) {
          this.setState('blocked', 'A folha selecionada não tem snapshot mutável e reconciliado com revisão forte.'); return;
        }
        this.destination = Object.freeze({ folhaPagamentoId: id, resourceVersion: etag });
        if (this.eventId == null && this.initialDraft.folhaPagamentoId === id && !this.initialCapture)
          this.initialCapture = this.destination;
        this.restoreKnownCapture();
      },
      error: () => {
        if (generation === this.generation && cycle === this.cycle && form === this.form)
          this.setState('blocked', 'Falha na captura da folha. Preserve o rascunho e tente a captura explicitamente.');
      },
    });
  }

  onPayloadPreview(event: FormPayloadPreviewEvent): void {
    if (!this.form || event.entityId != null && event.entityId !== this.eventId) return;
    if (event.reason === 'reset') {
      this.cancelDestination(); this.selectedId = this.initialDraft.folhaPagamentoId ?? null;
      this.destination = this.initialCapture; this.serialized = false;
      this.form.patchValue(this.initialDraft, { emitEvent: false });
      this.restoreKnownCapture(); return;
    }
    if (event.reason === 'entity-hydrated' && this.eventId != null && !this.hydrated) {
      this.hydrated = true; this.selectedId = this.parentId(this.form.get('folhaPagamentoId')?.value);
      this.restoreKnownCapture(); return;
    }
    this.serialized = this.sameConditions(event.formData?.precondicoesFolhas, this.expectedConditions());
    this.revalidate();
  }

  onSubmit(event: FormSubmitEvent): void {
    if (event.stage === 'before') return; // Observation only; the persistent validator is the gate.
    if (event.stage === 'after') {
      this.cancelReads(); this.detachForm(); this.mounted.set(false);
      this.origin = this.destination = this.initialCapture = undefined; this.eventEtag = undefined;
      this.setState('saved', 'Evento confirmado. O editor foi encerrado; uma nova edição exige novo snapshot.'); return;
    }
    this.preservedDraft.set(this.safeDraft(this.form?.getRawValue()));
    this.cancelDestination(); this.conflict = true; this.serialized = false;
    this.setState('conflict', 'A confirmação falhou ou entrou em conflito. Rascunho preservado; recarregue explicitamente para comparar e revisar.');
  }

  private restoreKnownCapture(): void {
    const expected = this.expectedConditions(), array = this.form?.get('precondicoesFolhas');
    if (!this.schemaAdmitted || !(array instanceof FormArray) || !this.arrayMetadata?.array?.itemSchema?.fields) { this.revalidate(); return; }
    array.clear({ emitEvent: false });
    for (const item of expected) array.push(this.arrays.createArrayItemGroupFromMetadata(this.arrayMetadata, item), { emitEvent: false });
    this.serialized = false;
    this.setState(this.conflict ? 'conflict' : expected.length ? 'ready' : 'blocked', this.conflict
      ? 'Conflito preservado. Reset não renova revisões; recarregue explicitamente para revisão.'
      : expected.length ? 'Revisões capturadas. A confirmação depende também da validação do formulário.'
      : 'A revisão selecionada não está capturada. Faça uma captura explícita antes de confirmar.');
    this.clearSerializeTimer();
    if (expected.length > 0 && !this.conflict) {
      // Defer the controlled emission past PraxisDynamicForm's synchronous buildForm bootstrap suppression window.
      const form = this.form, cycle = this.cycle, generation = this.generation;
      this.serializeTimer = setTimeout(() => {
        this.serializeTimer = undefined;
        if (!this.destroyed && this.form === form && this.cycle === cycle && this.generation === generation
          && !this.conflict && this.state() === 'ready' && !this.serialized) {
          form?.updateValueAndValidity({ emitEvent: true });
        }
      }, 0);
    }
  }

  private expectedConditions(): PayrollParentPrecondition[] {
    if (this.selectedId == null) return [];
    if (this.origin?.folhaPagamentoId === this.selectedId) return [this.origin];
    if (this.destination?.folhaPagamentoId !== this.selectedId) return [];
    return this.origin ? [this.origin, this.destination] : [this.destination];
  }
  private sameConditions(value: unknown, expected: readonly PayrollParentPrecondition[]): boolean {
    return expected.length > 0 && Array.isArray(value) && value.length === expected.length
      && value.every((item, index) => item?.folhaPagamentoId === expected[index].folhaPagamentoId
        && item?.resourceVersion === expected[index].resourceVersion);
  }
  private parentId(value: unknown): number | null { return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : null; }
  private safeDraft(value: any): EventDraft { return { descricao: value?.descricao, tipo: value?.tipo, valor: value?.valor, folhaPagamentoId: value?.folhaPagamentoId }; }
  private setState(state: CaptureState, message: string): void { this.state.set(state); this.message.set(message); this.revalidate(); }
  private revalidate(): void { this.form?.updateValueAndValidity({ emitEvent: false }); }
  private clearSerializeTimer(): void {
    if (this.serializeTimer !== undefined) { clearTimeout(this.serializeTimer); this.serializeTimer = undefined; }
  }
  private cancelDestination(): void { this.clearSerializeTimer(); this.generation++; this.destinationRead?.unsubscribe(); this.destinationRead = undefined; }
  private cancelReads(): void { this.cancelDestination(); this.eventRead?.unsubscribe(); this.eventRead = undefined; }
  private detachForm(): void {
    this.clearSerializeTimer();
    const detached = this.form;
    this.form = undefined; this.arrayMetadata = undefined; this.schemaAdmitted = false;
    // An async submit still holding the obsolete group must also stay invalid.
    detached?.updateValueAndValidity({ emitEvent: false });
  }
}
