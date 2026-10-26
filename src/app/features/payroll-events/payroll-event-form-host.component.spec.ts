import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { API_URL, type FieldMetadata, type FormPayloadPreviewEvent, type FormReadyEvent,
  type FormSubmitEvent, type FormValueChangeEvent } from '@praxisui/core';
import { PayrollEventFormHostComponent } from './payroll-event-form-host.component';

const API = 'https://payroll.test/api/human-resources';
const arrayMetadata = {
  name: 'precondicoesFolhas', controlType: 'array-input', formHidden: true, submitPolicy: 'include',
  array: { itemSchema: { fields: [
    { name: 'folhaPagamentoId', controlType: 'number', required: true, submitPolicy: 'include' },
    { name: 'resourceVersion', controlType: 'text', required: true, submitPolicy: 'include' },
  ] } },
} as unknown as FieldMetadata;

describe('PayrollEventFormHostComponent snapshot bridge (published rc.34 APIs)', () => {
  let host: PayrollEventFormHostComponent;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PayrollEventFormHostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(),
        { provide: API_URL, useValue: { default: { baseUrl: 'https://payroll.test/api' } } }],
    }).overrideComponent(PayrollEventFormHostComponent, { set: { template: '' } });
    const fixture = TestBed.createComponent(PayrollEventFormHostComponent);
    host = fixture.componentInstance; host.operationalContext = 'authorized-scope-A';
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { host.ngOnDestroy(); http.verify(); });

  function ready(parent: number | null, withArray = true): FormGroup {
    const form = new FormGroup({ descricao: new FormControl('Draft'), tipo: new FormControl('ADICIONAL'),
      valor: new FormControl(0.01), folhaPagamentoId: new FormControl(parent),
      ...(withArray ? { precondicoesFolhas: new FormArray([]) } : {}),
    });
    host.onFormReady({ formGroup: form, fieldsMetadata: withArray ? [arrayMetadata] : [], hasEntity: host.eventId != null } as FormReadyEvent);
    return form;
  }
  function preview(form: FormGroup, reason: FormPayloadPreviewEvent['reason'] = 'value-change', data = form.getRawValue()): void {
    host.onPayloadPreview({ formData: data, rawFormData: form.getRawValue(), reason,
      changedFields: [], isValid: form.valid, operation: host.eventId == null ? 'create' : 'update',
      entityId: host.eventId ?? undefined });
  }
  function change(form: FormGroup, parent: number): void {
    form.get('folhaPagamentoId')!.setValue(parent);
    host.onValueChange({ formData: form.getRawValue(), changedFields: ['folhaPagamentoId'], isValid: form.valid } as FormValueChangeEvent);
  }
  function edit(): FormGroup {
    host.eventId = 7; host.ngOnChanges();
    expect(host.mounted()).toBeFalse();
    http.expectOne(`${API}/eventos-folha/7`).flush({ data: { id: 7, descricao: 'Draft', tipo: 'ADICIONAL',
      valor: 0.01, folhaPagamentoId: 10, status: 'PENDENTE',
      precondicaoFolhaAtual: { folhaPagamentoId: 10, resourceVersion: '"origin-v3"' } } }, { headers: { ETag: '"event-v2"' } });
    expect(host.mounted()).toBeTrue();
    const form = ready(10); preview(form, 'entity-hydrated'); preview(form); return form;
  }

  it('captures a strong destination before create and requires serialized real array controls', () => {
    host.initialParentId = 10; host.ngOnChanges(); const form = ready(10);
    expect(form.invalid).toBeTrue(); expect(host.state()).toBe('capturing');
    http.expectOne(`${API}/folhas-pagamento/10`).flush({ data: { id: 10, reconciliacao: 'CONFIRMADA' } }, { headers: { ETag: '"parent\\opaque"' } });
    const array = form.get('precondicoesFolhas') as FormArray;
    expect(array.length).toBe(1); expect(array.at(0) instanceof FormGroup).toBeTrue();
    expect(array.at(0).enabled).toBeTrue(); expect(form.invalid).toBeTrue();
    preview(form); expect(form.valid).toBeTrue();
    expect(JSON.parse(JSON.stringify(form.getRawValue())).precondicoesFolhas)
      .toEqual([{ folhaPagamentoId: 10, resourceVersion: '"parent\\opaque"' }]);
  });

  it('keeps a persistent invalid root after weak/missing ETag and unrelated field changes', () => {
    host.initialParentId = 10; host.ngOnChanges(); const form = ready(10);
    http.expectOne(`${API}/folhas-pagamento/10`).flush({ data: { id: 10, reconciliacao: 'CONFIRMADA' } }, { headers: { ETag: 'W/"v1"' } });
    form.get('descricao')!.setValue('Changed'); form.updateValueAndValidity();
    preview(form); expect(form.hasError('payrollParentCapture')).toBeTrue();
  });

  it('rejects a destination response whose body identity differs from selection', () => {
    host.initialParentId = 10; host.ngOnChanges(); const form = ready(10);
    http.expectOne(`${API}/folhas-pagamento/10`).flush({ data: { id: 11, reconciliacao: 'CONFIRMADA' } }, { headers: { ETag: '"v1"' } });
    preview(form); expect(form.invalid).toBeTrue(); expect(host.state()).toBe('blocked');
  });

  it('blocks paid and unreconciled destinations without accepting their strong token', () => {
    host.initialParentId = 10; host.ngOnChanges(); const form = ready(10);
    http.expectOne(`${API}/folhas-pagamento/10`).flush({ data: { id: 10, reconciliacao: 'CONFIRMADA', estado: 'PAGA' } },
      { headers: { ETag: '"paid"' } });
    preview(form); expect(form.invalid).toBeTrue(); expect(host.state()).toBe('blocked');
    change(form, 20);
    http.expectOne(`${API}/folhas-pagamento/20`).flush({ data: { id: 20, reconciliacao: 'PENDENTE' } },
      { headers: { ETag: '"history"' } });
    preview(form); expect(form.invalid).toBeTrue(); expect(host.state()).toBe('blocked');
    expect((form.get('precondicoesFolhas') as FormArray).length).toBe(0);
  });

  it('hydrates edit from a single event read and never reads origin separately', () => {
    const form = edit(); expect(host.eventEtag).toBe('"event-v2"'); expect(form.valid).toBeTrue();
    http.expectNone(`${API}/folhas-pagamento/10`);
    expect(form.getRawValue().precondicoesFolhas).toEqual([{ folhaPagamentoId: 10, resourceVersion: '"origin-v3"' }]);
  });

  it('captures destination for move, preserving origin; returning to origin reuses the original capture', () => {
    const form = edit(); change(form, 20); expect(form.invalid).toBeTrue();
    http.expectOne(`${API}/folhas-pagamento/20`).flush({ data: { id: 20, reconciliacao: 'CONFIRMADA' } }, { headers: { ETag: '"target-v9"' } });
    preview(form); expect(form.valid).toBeTrue();
    expect(form.getRawValue().precondicoesFolhas).toEqual([
      { folhaPagamentoId: 10, resourceVersion: '"origin-v3"' }, { folhaPagamentoId: 20, resourceVersion: '"target-v9"' },
    ]);
    change(form, 10); preview(form); expect(form.valid).toBeTrue();
    http.expectNone(`${API}/folhas-pagamento/10`);
    expect(form.getRawValue().precondicoesFolhas.length).toBe(1);
  });

  it('cancels the superseded selection and cannot capture its late response', () => {
    const form = edit(); change(form, 20); const stale = http.expectOne(`${API}/folhas-pagamento/20`);
    change(form, 30); expect(stale.cancelled).toBeTrue();
    http.expectOne(`${API}/folhas-pagamento/30`).flush({ data: { id: 30, reconciliacao: 'CONFIRMADA' } }, { headers: { ETag: '"current"' } });
    preview(form); expect(form.getRawValue().precondicoesFolhas[1]).toEqual({ folhaPagamentoId: 30, resourceVersion: '"current"' });
  });

  it('restores edit snapshot on reset without renewing either token', () => {
    const form = edit(); change(form, 20); const request = http.expectOne(`${API}/folhas-pagamento/20`);
    form.reset(); preview(form, 'reset'); preview(form);
    expect(request.cancelled).toBeTrue(); expect(form.get('folhaPagamentoId')!.value).toBe(10);
    expect(form.getRawValue().precondicoesFolhas).toEqual([{ folhaPagamentoId: 10, resourceVersion: '"origin-v3"' }]);
    expect(form.valid).toBeTrue(); http.expectNone(`${API}/folhas-pagamento/10`);
  });

  it('restores the initial create capture on reset and does not perform GET on reset', () => {
    host.initialParentId = 10; host.ngOnChanges(); const form = ready(10);
    http.expectOne(`${API}/folhas-pagamento/10`).flush({ data: { id: 10, reconciliacao: 'CONFIRMADA' } }, { headers: { ETag: '"initial"' } }); preview(form);
    change(form, 20); http.expectOne(`${API}/folhas-pagamento/20`).flush({ data: { id: 20, reconciliacao: 'CONFIRMADA' } }, { headers: { ETag: '"later"' } });
    form.reset(); preview(form, 'reset'); preview(form);
    expect(form.getRawValue().precondicoesFolhas).toEqual([{ folhaPagamentoId: 10, resourceVersion: '"initial"' }]);
    expect(form.valid).toBeTrue(); http.expectNone(`${API}/folhas-pagamento/10`);
  });

  it('blocks reset when the initial create snapshot never acquired a token', () => {
    host.initialParentId = 10; host.ngOnChanges(); const form = ready(10);
    const request = http.expectOne(`${API}/folhas-pagamento/10`);
    form.reset(); preview(form, 'reset'); preview(form);
    expect(request.cancelled).toBeTrue(); expect(form.invalid).toBeTrue(); expect(host.state()).toBe('blocked');
  });

  it('fails closed when schema does not provide a real FormArray, without inventing a control', () => {
    host.initialParentId = 10; host.ngOnChanges(); const form = ready(10, false);
    expect(form.get('precondicoesFolhas')).toBeNull(); expect(form.invalid).toBeTrue();
    http.expectNone(`${API}/folhas-pagamento/10`);
  });

  it('does not capture tokens when canonical metadata would expose the transport array in the layout', () => {
    host.initialParentId = 10; host.ngOnChanges();
    const form = new FormGroup({ folhaPagamentoId: new FormControl(10), precondicoesFolhas: new FormArray([]) });
    host.onFormReady({ formGroup: form, fieldsMetadata: [{ ...arrayMetadata, formHidden: false }], hasEntity: false });
    host.captureSelectedParent(); preview(form);
    expect(form.invalid).toBeTrue(); http.expectNone(`${API}/folhas-pagamento/10`);
    expect((form.get('precondicoesFolhas') as FormArray).length).toBe(0);
  });

  it('rejects omitted serialized preconditions and tampered or duplicate tokens', () => {
    const form = edit(); preview(form, 'value-change', { descricao: 'Draft' } as any);
    expect(form.invalid).toBeTrue(); preview(form); expect(form.valid).toBeTrue();
    (form.get('precondicoesFolhas') as FormArray).at(0).get('resourceVersion')!.setValue('"tampered"');
    form.updateValueAndValidity(); expect(form.invalid).toBeTrue();
  });

  it('preserves draft after conflict, stays blocked through reset, and never refreshes on submit error', () => {
    const form = edit(); form.get('descricao')!.setValue('Preserve me');
    host.onSubmit({ stage: 'error', error: { status: 412 } } as FormSubmitEvent);
    expect(host.preservedDraft()?.descricao).toBe('Preserve me'); expect(form.invalid).toBeTrue();
    preview(form, 'reset'); preview(form); expect(host.state()).toBe('conflict'); expect(form.invalid).toBeTrue();
    http.expectNone(`${API}/eventos-folha/7`); http.expectNone(`${API}/folhas-pagamento/10`);
  });

  it('closes after successful submit and does not assume the receipt supplies a reusable ETag', () => {
    edit(); host.onSubmit({ stage: 'after', result: {} } as FormSubmitEvent);
    expect(host.mounted()).toBeFalse(); expect(host.state()).toBe('saved');
  });

  it('cancels reads and discards captures on operational scope change', () => {
    const form = edit(); change(form, 20); const request = http.expectOne(`${API}/folhas-pagamento/20`);
    host.operationalContext = 'authorized-scope-B'; host.ngOnChanges();
    expect(request.cancelled).toBeTrue(); expect(host.mounted()).toBeFalse(); expect(host.eventEtag).toBeUndefined();
    http.expectOne(`${API}/eventos-folha/7`).flush({}, { status: 403, statusText: 'Forbidden' });
    expect(host.mounted()).toBeFalse(); expect(host.preservedDraft()).toBeNull();
  });

  it('invalidates obsolete groups and cancels reads when the form rebuilds', () => {
    const previous = edit(); change(previous, 20);
    const request = http.expectOne(`${API}/folhas-pagamento/20`);
    const rebuilt = ready(20); preview(rebuilt, 'entity-hydrated'); preview(rebuilt);
    expect(request.cancelled).toBeTrue(); expect(previous.invalid).toBeTrue();
    expect(rebuilt.invalid).toBeTrue(); http.expectNone(`${API}/folhas-pagamento/20`);
  });

  it('captures destination for move when folhaPagamentoId is selected via entityLookup result object', () => {
    const form = edit();
    form.get('folhaPagamentoId')!.setValue({
      id: 20,
      label: 'Folha 2027-04 · #20',
      extra: { selectable: true, resourcePath: '/api/human-resources/folhas-pagamento', entityKey: 'payroll' },
    });
    host.onValueChange({ formData: form.getRawValue(), changedFields: ['folhaPagamentoId'], isValid: form.valid } as FormValueChangeEvent);
    expect(form.invalid).toBeTrue();
    http.expectOne(`${API}/folhas-pagamento/20`).flush({ data: { id: 20, reconciliacao: 'CONFIRMADA' } }, { headers: { ETag: '"target-v9"' } });
    preview(form);
    expect(form.valid).toBeTrue();
    expect(form.getRawValue().precondicoesFolhas).toEqual([
      { folhaPagamentoId: 10, resourceVersion: '"origin-v3"' },
      { folhaPagamentoId: 20, resourceVersion: '"target-v9"' },
    ]);
  });

  it('preserves operational decimal JSON values at the public transport boundary without calculating money', () => {
    const form = edit();
    for (const value of [0, 0.01, 100, 999999999999.99]) {
      form.get('valor')!.setValue(value); preview(form);
      expect(JSON.parse(JSON.stringify(form.getRawValue())).valor).toBe(value);
    }
  });
});
