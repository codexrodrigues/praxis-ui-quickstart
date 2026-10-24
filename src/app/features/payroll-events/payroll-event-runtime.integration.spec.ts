import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { API_URL, provideGlobalConfig, provideGlobalConfigReady, provideGlobalConfigSeed } from '@praxisui/core';
import { providePraxisDynamicFieldsCore } from '@praxisui/dynamic-fields';
import { providePraxisDynamicFormMetadata } from '@praxisui/dynamic-form';
import { PayrollEventFormHostComponent } from './payroll-event-form-host.component';

const schema = {
  type: 'object', required: ['descricao', 'tipo', 'valor', 'folhaPagamentoId', 'precondicoesFolhas'],
  properties: {
    descricao: { type: 'string', default: 'Adicional', 'x-ui': { label: 'Descrição', controlType: 'input' } },
    tipo: { type: 'string', default: 'ADICIONAL', 'x-ui': { label: 'Tipo', controlType: 'input' } },
    valor: { type: 'number', default: 0.01, 'x-ui': { label: 'Valor', controlType: 'currency', currency: 'BRL', locale: 'pt-BR', decimalPlaces: 2 } },
    folhaPagamentoId: { type: 'integer', 'x-ui': { label: 'Folha', controlType: 'numericTextBox' } },
    precondicoesFolhas: { type: 'array', minItems: 1,
      'x-ui': { formHidden: true, submitPolicy: 'include', controlType: 'array' },
      items: { type: 'object', required: ['folhaPagamentoId', 'resourceVersion'], properties: {
        folhaPagamentoId: { type: 'integer', 'x-ui': { formHidden: true, submitPolicy: 'include', controlType: 'numericTextBox' } },
        resourceVersion: { type: 'string', 'x-ui': { formHidden: true, submitPolicy: 'include', controlType: 'input' } },
      } },
    },
  },
};

describe('Payroll event bridge + actual Dynamic Form rc.34 runtime', () => {
  async function setup(): Promise<void> {
    spyOn(globalThis, 'fetch').and.callFake(async (input) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      if (!url.includes('/schemas/filtered')) throw new Error('Unexpected schema transport in isolated test');
      return new Response(JSON.stringify(schema), { status: 200,
        headers: { 'Content-Type': 'application/json', ETag: '"event-create-schema"', 'X-Schema-Hash': 'g4-event-create' } });
    });
    await TestBed.configureTestingModule({ imports: [PayrollEventFormHostComponent], providers: [
      provideHttpClient(), provideHttpClientTesting(), provideNoopAnimations(),
      { provide: API_URL, useValue: { default: { baseUrl: 'https://g4-runtime.test/api' } } },
      ...providePraxisDynamicFieldsCore(), providePraxisDynamicFormMetadata(),
      provideGlobalConfig({}), provideGlobalConfigSeed({}), provideGlobalConfigReady(),
    ] }).compileComponents();
  }

  it('normalizes the schema, captures a parent, emits official payload preview and submits that snapshot', async () => {
    await setup();
    const fixture = TestBed.createComponent(PayrollEventFormHostComponent);
    fixture.componentRef.setInput('initialParentId', 10);
    fixture.componentRef.setInput('operationalContext', 'runtime-test-scope');
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    let captured = false;
    for (let turn = 0; turn < 30 && !captured; turn++) {
      await new Promise((resolve) => setTimeout(resolve, 0)); fixture.detectChanges();
      const reads = http.match((request) => request.url === 'https://g4-runtime.test/api/human-resources/folhas-pagamento/10');
      if (reads.length) {
        expect(reads.length).toBe(1);
        reads[0].flush({ data: { id: 10, reconciliacao: 'CONFIRMADA' } }, { headers: { ETag: '"parent-runtime-v2"' } }); captured = true;
      }
    }
    expect(captured).withContext(fixture.componentInstance.message()).toBeTrue();
    const runtime = fixture.componentInstance.eventForm!;
    expect(runtime?.form.get('precondicoesFolhas') instanceof FormArray).toBeTrue();
    // Let the real valueChange/preview debounce settle; no host preview event is fabricated.
    await new Promise((resolve) => setTimeout(resolve, 400)); fixture.detectChanges();
    expect(runtime.form.get('precondicoesFolhas')!.getRawValue())
      .toEqual([{ folhaPagamentoId: 10, resourceVersion: '"parent-runtime-v2"' }]);
    expect(runtime.form.hasError('payrollParentCapture')).toBeFalse();
    expect(fixture.nativeElement.textContent).not.toContain('parent-runtime-v2');
    expect(fixture.nativeElement.querySelector('[role="status"][aria-live="polite"]')).toBeTruthy();
    runtime.form.patchValue({ descricao: 'Adicional', tipo: 'ADICIONAL', valor: 0.01 });
    await runtime.onSubmit();
    const submit = http.expectOne('https://g4-runtime.test/api/human-resources/eventos-folha');
    expect(submit.request.method).toBe('POST');
    expect(submit.request.body.precondicoesFolhas).toEqual([{ folhaPagamentoId: 10, resourceVersion: '"parent-runtime-v2"' }]);
    expect(submit.request.body.valor).toBe(0.01);
    submit.flush({ data: { id: 100 } }); fixture.detectChanges();
    expect(fixture.componentInstance.mounted()).toBeFalse();
    http.verify(); fixture.destroy();
  }, 10000);

  it('hydrates edit once, moves with two parents and sends only the event ETag as If-Match', async () => {
    await setup();
    const fixture = TestBed.createComponent(PayrollEventFormHostComponent);
    fixture.componentRef.setInput('eventId', 7);
    fixture.componentRef.setInput('operationalContext', 'edit-runtime-scope');
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('https://g4-runtime.test/api/human-resources/eventos-folha/7').flush({ data: {
      id: 7, descricao: 'Adicional', tipo: 'ADICIONAL', valor: 100, folhaPagamentoId: 10, status: 'PENDENTE',
      precondicaoFolhaAtual: { folhaPagamentoId: 10, resourceVersion: '"origin-snapshot"' },
    } }, { headers: { ETag: '"event-snapshot"' } });
    for (let turn = 0; turn < 30; turn++) {
      await new Promise((resolve) => setTimeout(resolve, 0)); fixture.detectChanges();
      if (fixture.componentInstance.eventForm?.form.get('precondicoesFolhas') instanceof FormArray
        && fixture.componentInstance.state() === 'ready') break;
    }
    const runtime = fixture.componentInstance.eventForm!;
    expect(runtime.form.get('precondicoesFolhas')!.getRawValue())
      .toEqual([{ folhaPagamentoId: 10, resourceVersion: '"origin-snapshot"' }]);
    http.expectNone('https://g4-runtime.test/api/human-resources/folhas-pagamento/10');
    runtime.form.get('folhaPagamentoId')!.markAsDirty();
    runtime.form.get('folhaPagamentoId')!.setValue(20);
    await new Promise((resolve) => setTimeout(resolve, 400)); fixture.detectChanges();
    http.expectOne('https://g4-runtime.test/api/human-resources/folhas-pagamento/20')
      .flush({ data: { id: 20, reconciliacao: 'CONFIRMADA' } }, { headers: { ETag: '"destination-snapshot"' } });
    await new Promise((resolve) => setTimeout(resolve, 400)); fixture.detectChanges();
    expect(runtime.form.hasError('payrollParentCapture')).toBeFalse();
    expect(fixture.nativeElement.textContent).not.toContain('origin-snapshot');
    expect(fixture.nativeElement.textContent).not.toContain('destination-snapshot');
    await runtime.onSubmit();
    const submit = http.expectOne('https://g4-runtime.test/api/human-resources/eventos-folha/7');
    expect(submit.request.method).toBe('PUT');
    expect(submit.request.headers.get('If-Match')).toBe('"event-snapshot"');
    expect(submit.request.body.precondicoesFolhas).toEqual([
      { folhaPagamentoId: 10, resourceVersion: '"origin-snapshot"' },
      { folhaPagamentoId: 20, resourceVersion: '"destination-snapshot"' },
    ]);
    expect(submit.request.body.folhaPagamentoId).toBe(20);
    submit.flush({ data: { id: 7 } }); fixture.detectChanges();
    http.verify(); fixture.destroy();
  }, 10000);
});
