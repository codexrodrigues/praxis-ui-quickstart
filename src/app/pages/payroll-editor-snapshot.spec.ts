import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { API_URL, type FormReadyEvent } from '@praxisui/core';
import { ReactiveDeterminationsExamplePageComponent } from './reactive-determinations-example-page.component';

const API = 'https://payroll.test/api/human-resources/folhas-pagamento';

describe('Payroll editor snapshot lifecycle', () => {
  let page: any;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ReactiveDeterminationsExamplePageComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(),
        { provide: API_URL, useValue: { default: { baseUrl: 'https://payroll.test/api' } } }],
    }).overrideComponent(ReactiveDeterminationsExamplePageComponent, { set: { template: '' } });
    page = TestBed.createComponent(ReactiveDeterminationsExamplePageComponent).componentInstance;
    http = TestBed.inject(HttpTestingController);
    http.expectOne('https://payroll.test/auth/session').flush({});
  });
  afterEach(() => { page.ngOnDestroy(); http.verify(); });

  function snapshot(id: number, flushSchemas = true): void {
    if (flushSchemas)
      http.match((request) => request.url.includes('/schemas/filtered')).forEach((request) => request.flush({}));
    http.expectOne(`${API}/${id}`).flush({ data: { id, reconciliacao: 'CONFIRMADA',
      ano: 2026, mes: 10, funcionarioId: 8, salarioBruto: 100, descontosBase: 0.01,
      totalDescontos: 0.01, salarioLiquido: 99.99,
      dataPagamentoPrevista: '2026-10-30', dataPagamentoAgendada: '2026-11-02', dataPagamentoEfetiva: null,
    } }, { headers: { ETag: '"payroll-snapshot"' } });
  }
  function ready(): FormGroup {
    const form = new FormGroup({ salarioBruto: new FormControl(100), descontosBase: new FormControl(0.01) });
    page.onPayrollReady({ formGroup: form } as FormReadyEvent); return form;
  }

  it('retains the edit PUT schema when the initial create schemas arrive after the captured payroll', () => {
    const createSchema = { fields: [{ name: 'create-only' }] };
    const editSchema = { fields: [{ name: 'edit-only' }] };
    page.openPayrollEditor('11');
    http.expectOne((request) => request.url.includes('operation=put')).flush(editSchema);
    snapshot(11, false);
    expect(page.payrollMounted()).toBeTrue();
    expect(page.payrollSchema()).toEqual(editSchema);

    http.expectOne((request) => request.url.includes('/enderecos&operation=post')).flush({});
    http.expectOne((request) => request.url.includes('/folhas-pagamento&operation=post')).flush(createSchema);
    expect(page.payrollSchema()).toEqual(editSchema);
    expect(page.payrollEtag).toBe('"payroll-snapshot"');
    expect(page.selectedPayrollId()).toBe(11);

    page.openPayrollEditor('');
    expect(page.payrollSchema()).toEqual(createSchema);
    http.expectNone((request) => request.url.includes('/schemas/filtered'));
  });

  it('delivers the initial create schema to the current create cycle after an edit was discarded', () => {
    page.openPayrollEditor('11');
    const editSchema = http.expectOne((request) => request.url.includes('operation=put'));
    const detail = http.expectOne(`${API}/11`);
    page.openPayrollEditor('');
    expect(editSchema.cancelled).toBeTrue();
    expect(detail.cancelled).toBeTrue();
    const createSchema = { fields: [{ name: 'current-create' }] };
    http.expectOne((request) => request.url.includes('/enderecos&operation=post')).flush({});
    http.expectOne((request) => request.url.includes('/folhas-pagamento&operation=post')).flush(createSchema);
    expect(page.payrollSchema()).toEqual(createSchema);
    expect(page.payrollMounted()).toBeTrue();
    expect(page.selectedPayrollId()).toBeNull();
  });

  it('caches late initial metadata without changing a create cycle closed after success', () => {
    page.openPayrollEditor('');
    page.onPayrollSubmit({ stage: 'after' });
    const createSchema = { fields: [{ name: 'next-create' }] };
    http.expectOne((request) => request.url.includes('/enderecos&operation=post')).flush({});
    http.expectOne((request) => request.url.includes('/folhas-pagamento&operation=post')).flush(createSchema);
    expect(page.payrollSchema()).toBeNull();
    expect(page.payrollMounted()).toBeFalse();
    page.openPayrollEditor('');
    expect(page.payrollSchema()).toEqual(createSchema);
  });

  it('cancels the initial schemas on destruction before they can mutate the page', () => {
    const initial = http.match((request) => request.url.includes('/schemas/filtered'));
    expect(initial.length).toBe(2);
    page.ngOnDestroy();
    expect(initial.every((request) => request.cancelled)).toBeTrue();
    expect(page.payrollSchema()).toBeNull();
    expect(page.schemaState()).toBe('loading');
  });

  it('loads before mounting edit and preserves base facts, three dates and the opaque ETag', () => {
    page.openPayrollEditor('11'); expect(page.payrollMounted()).toBeFalse();
    snapshot(11);
    expect(page.payrollMounted()).toBeTrue();
    expect(page.payrollEtag).toBe('"payroll-snapshot"');
    expect(page.payrollSchemaUrl).toContain('folhas-pagamento/{id}&operation=put');
    expect(page.payrollInitialValue.descontosBase).toBe(0.01);
    expect(page.payrollSnapshot().dataPagamentoAgendada).toBe('2026-11-02');
    expect(page.payrollSnapshot().dataPagamentoEfetiva).toBeNull();
    expect(ready().valid).toBeTrue();
  });

  it('cancels obsolete reads and invalidates an old form when selecting another payroll', () => {
    page.openPayrollEditor('11'); snapshot(11); const old = ready();
    page.openPayrollEditor('12'); const stale = http.expectOne(`${API}/12`);
    const staleSchema = http.expectOne((request) => request.url.includes('/schemas/filtered'));
    page.openPayrollEditor('13'); expect(stale.cancelled).toBeTrue();
    expect(staleSchema.cancelled).toBeTrue();
    expect(old.invalid).toBeTrue(); snapshot(13); expect(page.payrollInitialValue.id).toBe(13);
  });

  it('fails closed on historical or weak/mismatched snapshots', () => {
    page.openPayrollEditor('11');
    http.match((request) => request.url.includes('/schemas/filtered')).forEach((request) => request.flush({}));
    http.expectOne(`${API}/11`).flush({ data: { id: 11, reconciliacao: 'PENDENTE', valoresOriginais: { salarioBruto: '100.001' } } },
      { headers: { ETag: '"history"' } });
    expect(page.payrollMounted()).toBeFalse();
    page.openPayrollEditor('12');
    http.match((request) => request.url.includes('/schemas/filtered')).forEach((request) => request.flush({}));
    http.expectOne(`${API}/12`).flush({ data: { id: 99, reconciliacao: 'CONFIRMADA', salarioBruto: 100, descontosBase: 0 } },
      { headers: { ETag: 'W/"weak"' } });
    expect(page.payrollMounted()).toBeFalse(); expect(page.payrollEtag).toBeUndefined();
  });

  it('keeps paid payroll immutable even with a valid strong snapshot', () => {
    page.openPayrollEditor('11');
    http.match((request) => request.url.includes('/schemas/filtered')).forEach((request) => request.flush({}));
    http.expectOne(`${API}/11`).flush({ data: { id: 11, reconciliacao: 'CONFIRMADA', estado: 'PAGA',
      salarioBruto: 100, descontosBase: 0, dataPagamentoEfetiva: '2026-10-22' } },
      { headers: { ETag: '"paid"' } });
    expect(page.payrollMounted()).toBeFalse(); expect(page.payrollEtag).toBeUndefined();
  });

  it('preserves a conflict draft, keeps reset blocked, and refreshes only on explicit review', () => {
    page.openPayrollEditor('11'); snapshot(11); const form = ready();
    form.get('descontosBase')!.setValue(12.34);
    page.onPayrollSubmit({ stage: 'error', error: { status: 412 } });
    expect(page.payrollPreservedDraft().descontosBase).toBe(12.34);
    form.reset(); form.updateValueAndValidity(); expect(form.invalid).toBeTrue();
    http.expectNone(`${API}/11`);
    page.reloadPayrollForReview(); snapshot(11);
    expect(page.payrollPreservedDraft().descontosBase).toBe(12.34);
    expect(page.payrollConflict()).toBeFalse(); expect(form.invalid).toBeTrue();
  });

  it('closes successful edits and clears sensitive state at logout', () => {
    page.openPayrollEditor('11'); snapshot(11); const form = ready();
    page.onPayrollSubmit({ stage: 'after' });
    expect(page.payrollMounted()).toBeFalse(); expect(form.invalid).toBeTrue();
    page.finishLogout(); expect(page.payrollInitialValue).toEqual({});
    expect(page.payrollSnapshot()).toBeNull(); expect(page.payrollEtag).toBeUndefined();
  });
});
