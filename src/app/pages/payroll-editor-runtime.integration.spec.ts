import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { API_URL, GenericCrudService, provideGlobalConfig, provideGlobalConfigReady, provideGlobalConfigSeed } from '@praxisui/core';
import { providePraxisDynamicFieldsCore } from '@praxisui/dynamic-fields';
import { PraxisDynamicForm, providePraxisDynamicFormMetadata } from '@praxisui/dynamic-form';
import { ReactiveDeterminationsExamplePageComponent } from './reactive-determinations-example-page.component';

// Representative request projection of ReactiveDeterminationPilotConfiguration v2.
// Transport is mocked: this does not certify the backend-generated schema or financial results.
const inputs = ['funcionarioId', 'ano', 'mes', 'salarioBruto', 'descontosBase'];
const definition = (calendar: boolean) => ({
  id: `human-resources.payroll.${calendar ? 'payment-date' : 'net-salary'}.edit`,
  scope: { schemaOperationId: 'updatePayroll', formMode: 'edit' },
  trigger: { mode: 'on-change', sourcePaths: (calendar ? [...inputs, 'salarioLiquido'] : inputs).map((key) => '/' + key) },
  inputs: [...(calendar ? [...inputs, 'salarioLiquido'] : inputs).map((key) => ({ fieldPath: '/' + key, requestPath: '/' + key })),
    { fieldPath: '/id', requestPath: '/folhaPagamentoId' }],
  outputs: (calendar ? ['dataPagamentoPrevista'] : ['totalDescontos', 'salarioLiquido'])
    .map((key) => ({ responsePath: '/' + key, fieldPath: '/' + key })),
  capability: { operationId: calendar ? 'determinePayrollPaymentDate' : 'determinePayrollNetSalary', method: 'POST',
    href: `/api/human-resources/folhas-pagamento/determinations/${calendar ? 'payment-date' : 'net-salary'}`,
    requestSchemaUrl: '/schemas/filtered?path=request', responseSchemaUrl: '/schemas/filtered?path=response' },
  provenance: { kind: 'host', source: 'praxis-api-quickstart', version: '2' },
});
const schema = {
  type: 'object', required: [...inputs, 'id', 'totalDescontos', 'salarioLiquido', 'dataPagamentoPrevista'],
  properties: Object.fromEntries([...inputs, 'id', 'totalDescontos', 'salarioLiquido', 'dataPagamentoPrevista'].map((key) => [key, {
    type: key === 'dataPagamentoPrevista' ? 'string' : 'number',
    'x-ui': { label: key, controlType: key === 'dataPagamentoPrevista' ? 'input' : 'numericTextBox', formHidden: key === 'id' },
  }])),
  'x-ui': { reactiveDeterminations: [definition(false), definition(true)] },
};

describe('Payroll edit + actual published Dynamic Form reactive runtime', () => {
  it('keeps failed determinations unsatisfied, applies backend outputs and PUTs the captured ETag and request fields', async () => {
    spyOn(globalThis, 'fetch').and.callFake(async (input) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      if (!url.includes('/schemas/filtered')) throw new Error('Unexpected isolated schema transport');
      return new Response(JSON.stringify(url.includes('folhas-pagamento') ? schema : {
        type: 'object', properties: { cep: { type: 'string', 'x-ui': { label: 'CEP', controlType: 'input' } } },
      }),
        { status: 200, headers: { 'Content-Type': 'application/json', ETag: '"schema-v2"', 'X-Schema-Hash': 'g4-payroll-edit' } });
    });
    await TestBed.configureTestingModule({ imports: [ReactiveDeterminationsExamplePageComponent], providers: [
      provideHttpClient(), provideHttpClientTesting(), provideNoopAnimations(), provideRouter([]), GenericCrudService,
      { provide: API_URL, useValue: { default: { baseUrl: 'https://payroll-runtime.test/api' } } },
      ...providePraxisDynamicFieldsCore(), providePraxisDynamicFormMetadata(),
      provideGlobalConfig({}), provideGlobalConfigSeed({}), provideGlobalConfigReady(),
    ] }).compileComponents();
    const fixture = TestBed.createComponent(ReactiveDeterminationsExamplePageComponent);
    const page: any = fixture.componentInstance;
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('https://payroll-runtime.test/auth/session').flush({});
    http.match((request) => request.url.includes('/schemas/filtered')).forEach((request) => request.flush(schema));
    page.openPayrollEditor('11');
    http.expectOne('https://payroll-runtime.test/schemas/filtered?path=/api/human-resources/folhas-pagamento/{id}&operation=put&schemaType=request').flush(schema);
    http.expectOne('https://payroll-runtime.test/api/human-resources/folhas-pagamento/11').flush({ data: {
      id: 11, reconciliacao: 'CONFIRMADA', funcionarioId: 8, ano: 2026, mes: 10,
      salarioBruto: 100, descontosBase: 0.01, totalDescontos: 0.01, salarioLiquido: 99.99,
      dataPagamentoPrevista: '2026-10-30', dataPagamentoAgendada: '2026-11-02', dataPagamentoEfetiva: null,
    } }, { headers: { ETag: '"payroll-captured"' } });
    fixture.detectChanges();
    const settle = async (ms = 400) => { await new Promise((resolve) => setTimeout(resolve, ms)); fixture.detectChanges(); };
    let runtime: PraxisDynamicForm | undefined;
    for (let turn = 0; turn < 30; turn++) {
      await settle(10);
      runtime = fixture.debugElement.queryAll(By.directive(PraxisDynamicForm))
        .map((node) => node.componentInstance as PraxisDynamicForm).find((form) => form.resourceId === 11);
      if (runtime?.form.get('salarioBruto')) break;
    }
    expect(runtime?.form.get('descontosBase')?.value).toBe(0.01);
    await settle();
    const netUrl = 'https://payroll-runtime.test/api/human-resources/folhas-pagamento/determinations/net-salary';
    const dateUrl = 'https://payroll-runtime.test/api/human-resources/folhas-pagamento/determinations/payment-date';
    const firstNet = http.expectOne(netUrl);
    expect(firstNet.request.body.folhaPagamentoId).toBe(11);
    expect(runtime!.hasUnsatisfiedReactiveDeterminations()).toBeTrue();
    firstNet.flush({}, { status: 503, statusText: 'Unavailable' });
    http.match(dateUrl).forEach((request) => request.flush({}, { status: 503, statusText: 'Unavailable' }));
    await settle();
    expect(runtime!.hasUnsatisfiedReactiveDeterminations()).toBeTrue();
    expect(page.stateFor('payroll')).toBe('unsatisfied');
    await runtime!.onSubmit();
    http.expectNone((request) => request.method === 'PUT');
    runtime!.form.get('descontosBase')!.setValue(1);
    await settle();
    http.expectOne(netUrl).flush({ data: { totalDescontos: 1, salarioLiquido: 99 } });
    // An input change can supersede the calendar generation started with the previous net value.
    http.match(dateUrl).forEach((request) => { if (!request.cancelled) request.flush({ data: { dataPagamentoPrevista: '2026-10-29' } }); });
    await settle();
    http.match(dateUrl).forEach((request) => request.flush({ data: { dataPagamentoPrevista: '2026-10-29' } }));
    await settle();
    expect(runtime!.hasUnsatisfiedReactiveDeterminations()).toBeFalse();
    expect(page.stateFor('payroll')).toBe('satisfied');
    expect(runtime!.form.get('salarioLiquido')!.disabled).toBeTrue();
    expect(runtime!.form.getRawValue().salarioLiquido).toBe(99);
    expect(fixture.nativeElement.textContent).toContain('2026-11-02');
    expect(fixture.nativeElement.textContent).toContain('Não confirmado');
    await runtime!.onSubmit();
    const submit = http.expectOne((request) => request.method === 'PUT');
    expect(submit.request.url).toBe('https://payroll-runtime.test/api/human-resources/folhas-pagamento/11');
    expect(submit.request.headers.get('If-Match')).toBe('"payroll-captured"');
    expect(submit.request.body.descontosBase).toBe(1);
    expect(submit.request.body.dataPagamentoPrevista).toBe('2026-10-29');
    expect(submit.request.body.dataPagamentoAgendada).toBeUndefined();
    expect(submit.request.body.dataPagamentoEfetiva).toBeUndefined();
    http.expectNone((request) => request.method === 'GET' && request.url.endsWith('/folhas-pagamento/11'));
    submit.flush({ data: { id: 11 } }); fixture.detectChanges();
    expect(page.payrollMounted()).toBeFalse();
    http.verify(); fixture.destroy();
  }, 15000);
});
