import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { API_URL, GenericCrudService } from '@praxisui/core';
import { PraxisDynamicForm, providePraxisDynamicFormMetadata } from '@praxisui/dynamic-form';
import { ReactiveDeterminationDiagnosticsComponent } from '@praxisui/metadata-editor';
import { PayrollEventFormHostComponent } from '../features/payroll-events/payroll-event-form-host.component';
import { ReactiveDeterminationsExamplePageComponent } from './reactive-determinations-example-page.component';

describe('ReactiveDeterminationsExamplePageComponent', () => {
  it('uses the two canonical resources and loads their exact request schemas', () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveDeterminationsExamplePageComponent,
      ],
      providers: [
        provideRouter([]),
        GenericCrudService,
        providePraxisDynamicFormMetadata(),
        { provide: API_URL, useValue: { default: { baseUrl: 'http://localhost/api' } } },
      ],
    });

    const fixture = TestBed.createComponent(ReactiveDeterminationsExamplePageComponent);
    const http = TestBed.inject(HttpTestingController);

    http.expectOne('http://localhost/auth/session').flush({ authenticated: true });

    http
      .expectOne(
        'http://localhost/schemas/filtered?path=/api/human-resources/enderecos&operation=post&schemaType=request',
      )
      .flush({ 'x-ui': { reactiveDeterminations: [{ id: 'address' }] } });
    http
      .expectOne(
        'http://localhost/schemas/filtered?path=/api/human-resources/folhas-pagamento&operation=post&schemaType=request',
      )
      .flush({ 'x-ui': { reactiveDeterminations: [{ id: 'payroll' }] } });
    fixture.detectChanges();

    const forms = fixture.debugElement.queryAll(By.directive(PraxisDynamicForm));
    expect(forms.length).toBe(2);
    expect(forms.map((node) => node.componentInstance.resourcePath)).toEqual([
      'human-resources/enderecos',
      'human-resources/folhas-pagamento',
    ]);
    expect(
      fixture.debugElement.queryAll(By.directive(ReactiveDeterminationDiagnosticsComponent)).length,
    ).toBe(2);
    expect(
      fixture.debugElement.queryAll(By.css('.state')).map((node) => node.nativeElement.textContent.trim()),
    ).toEqual(['ready', 'ready']);

    const payroll = forms[1].componentInstance as PraxisDynamicForm;
    const satisfaction = spyOn(payroll, 'hasUnsatisfiedReactiveDeterminations').and.returnValue(true);
    payroll.reactiveDeterminationExecuted.emit({ status: 'success', determinationId: 'payroll', correlationId: 'local-success' } as any);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.state'))[1].nativeElement.textContent.trim()).toBe('unsatisfied');
    satisfaction.and.returnValue(false);
    payroll.reactiveDeterminationExecuted.emit({ status: 'skipped', reason: 'superseded', determinationId: 'payroll', correlationId: 'local-superseded' } as any);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.state'))[1].nativeElement.textContent.trim()).toBe('ready');
    payroll.reactiveDeterminationExecuted.emit({ status: 'success', determinationId: 'payroll', correlationId: 'local-current' } as any);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.state'))[1].nativeElement.textContent.trim()).toBe('satisfied');

    fixture.debugElement.query(By.css('.secondary-action')).nativeElement.click();
    http.expectOne('http://localhost/auth/logout').flush({}); fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.directive(PraxisDynamicForm)).length).toBe(0);
    expect(fixture.nativeElement.textContent).not.toContain('local-current');

    http.verify();
  });

  it('does not report determinations as satisfied when schema evidence is unavailable', () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveDeterminationsExamplePageComponent],
      providers: [
        provideRouter([]),
        GenericCrudService,
        providePraxisDynamicFormMetadata(),
        { provide: API_URL, useValue: { default: { baseUrl: 'http://localhost/api' } } },
      ],
    });

    const fixture = TestBed.createComponent(ReactiveDeterminationsExamplePageComponent);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.directive(ReactiveDeterminationDiagnosticsComponent)).length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Loading determination diagnostics');
    expect(fixture.nativeElement.textContent).not.toContain('Sem determinações para esta operação');

    http.expectOne('http://localhost/auth/session').flush(
      { message: 'authentication required' },
      { status: 401, statusText: 'Unauthorized' },
    );

    http
      .expectOne(
        'http://localhost/schemas/filtered?path=/api/human-resources/folhas-pagamento&operation=post&schemaType=request',
      )
      .flush({});
    http
      .expectOne(
        'http://localhost/schemas/filtered?path=/api/human-resources/enderecos&operation=post&schemaType=request',
      )
      .flush({ message: 'unavailable' }, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();

    expect(
      fixture.debugElement.queryAll(By.css('.state')).map((node) => node.nativeElement.textContent.trim()),
    ).toEqual(['unavailable', 'unavailable']);
    expect(fixture.debugElement.query(By.css('[role="alert"]'))).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.directive(ReactiveDeterminationDiagnosticsComponent)).length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Determination diagnostics unavailable');
    expect(fixture.nativeElement.textContent).toContain('Its determination metadata cannot be verified.');
    expect(fixture.nativeElement.textContent).not.toContain('Sem determinações para esta operação');

    http.verify();
  });

  it('retains canonical empty diagnostics when both request schemas loaded without determinations', () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveDeterminationsExamplePageComponent],
      providers: [provideRouter([]), GenericCrudService, providePraxisDynamicFormMetadata(),
        { provide: API_URL, useValue: { default: { baseUrl: 'http://localhost/api' } } }],
    });
    const fixture = TestBed.createComponent(ReactiveDeterminationsExamplePageComponent);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('http://localhost/auth/session').flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne('http://localhost/schemas/filtered?path=/api/human-resources/enderecos&operation=post&schemaType=request').flush({});
    http.expectOne('http://localhost/schemas/filtered?path=/api/human-resources/folhas-pagamento&operation=post&schemaType=request').flush({});
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.directive(ReactiveDeterminationDiagnosticsComponent)).length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Sem determinações para esta operação');
    expect(fixture.nativeElement.textContent).not.toContain('Determination diagnostics unavailable');
    http.verify();
  });

  it('shows a later edit schema independently of failed initial POST schemas and clears it on create', () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveDeterminationsExamplePageComponent],
      providers: [provideRouter([]), GenericCrudService, providePraxisDynamicFormMetadata(),
        { provide: API_URL, useValue: { default: { baseUrl: 'http://localhost/api' } } }],
    });
    const fixture = TestBed.createComponent(ReactiveDeterminationsExamplePageComponent);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('http://localhost/auth/session').flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne('http://localhost/schemas/filtered?path=/api/human-resources/enderecos&operation=post&schemaType=request').flush({});
    http.expectOne('http://localhost/schemas/filtered?path=/api/human-resources/folhas-pagamento&operation=post&schemaType=request')
      .flush({}, { status: 503, statusText: 'Unavailable' });
    const page = fixture.componentInstance as any;
    page.openPayrollEditor('11');
    const editSchema = { 'x-ui': { reactiveDeterminations: [{ id: 'loaded-edit' }] } };
    http.expectOne((request) => request.url.includes('operation=put')).flush(editSchema);
    http.expectOne('http://localhost/api/human-resources/folhas-pagamento/11').flush({ data: {
      id: 11, reconciliacao: 'CONFIRMADA', salarioBruto: 100, descontosBase: 0,
    } }, { headers: { ETag: '"captured-edit"' } });
    fixture.detectChanges();
    expect(page.schemaState()).toBe('error');
    const diagnostics = fixture.debugElement.queryAll(By.directive(ReactiveDeterminationDiagnosticsComponent));
    expect(diagnostics.length).toBe(1);
    expect(diagnostics[0].componentInstance.schema()).toEqual(editSchema);
    expect(fixture.debugElement.query(By.css('[aria-label="Payroll determination diagnostics status"]'))).toBeNull();

    page.openPayrollEditor('');
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.directive(ReactiveDeterminationDiagnosticsComponent)).length).toBe(0);
    expect(fixture.debugElement.query(By.css('[aria-label="Payroll determination diagnostics status"]'))).toBeTruthy();
    http.verify();
  });

  it('keeps live forms disabled until the host establishes a business session', () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveDeterminationsExamplePageComponent],
      providers: [
        provideRouter([]),
        GenericCrudService,
        providePraxisDynamicFormMetadata(),
        { provide: API_URL, useValue: { default: { baseUrl: 'http://localhost/api' } } },
      ],
    });

    const fixture = TestBed.createComponent(ReactiveDeterminationsExamplePageComponent);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('http://localhost/auth/session').flush(
      {},
      { status: 401, statusText: 'Unauthorized' },
    );
    http.expectOne(
      'http://localhost/schemas/filtered?path=/api/human-resources/enderecos&operation=post&schemaType=request',
    ).flush({ 'x-ui': { reactiveDeterminations: [{ id: 'address' }] } });
    http.expectOne(
      'http://localhost/schemas/filtered?path=/api/human-resources/folhas-pagamento&operation=post&schemaType=request',
    ).flush({ 'x-ui': { reactiveDeterminations: [{ id: 'payroll' }] } });
    fixture.detectChanges();

    const forms = fixture.debugElement.queryAll(By.directive(PraxisDynamicForm));
    expect(forms.length).toBe(0);
    expect(
      fixture.debugElement
        .queryAll(By.css('fieldset.form-auth-boundary'))
        .every((node) => node.nativeElement.disabled === true),
    ).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Authentication required for live determinations');
    expect(
      fixture.debugElement.queryAll(By.css('.state')).map((node) => node.nativeElement.textContent.trim()),
    ).toEqual(['unavailable', 'unavailable']);
    http.verify();
  });

  it('passes the active payroll id as initialParentId when opening the event editor in create mode', () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveDeterminationsExamplePageComponent],
      providers: [
        provideRouter([]),
        GenericCrudService,
        providePraxisDynamicFormMetadata(),
        { provide: API_URL, useValue: { default: { baseUrl: 'http://localhost/api' } } },
      ],
    });

    const fixture = TestBed.createComponent(ReactiveDeterminationsExamplePageComponent);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('http://localhost/auth/session').flush({ authenticated: true });
    http
      .expectOne(
        'http://localhost/schemas/filtered?path=/api/human-resources/enderecos&operation=post&schemaType=request',
      )
      .flush({});
    http
      .expectOne(
        'http://localhost/schemas/filtered?path=/api/human-resources/folhas-pagamento&operation=post&schemaType=request',
      )
      .flush({});

    const page = fixture.componentInstance as any;
    page.openPayrollEditor('3249');
    http.expectOne((request) => request.url.includes('operation=put')).flush({});
    http.expectOne('http://localhost/api/human-resources/folhas-pagamento/3249').flush(
      { data: { id: 3249, reconciliacao: 'CONFIRMADA', salarioBruto: 1000, descontosBase: 100 } },
      { headers: { ETag: '"payroll-3249-v1"' } },
    );
    fixture.detectChanges();

    page.openEventEditor('');
    fixture.detectChanges();

    const eventHost = fixture.debugElement.query(By.directive(PayrollEventFormHostComponent))
      .componentInstance as PayrollEventFormHostComponent;
    expect(eventHost.eventId).toBeNull();
    expect(eventHost.initialParentId).toBe(3249);
    expect(eventHost.initialValue.folhaPagamentoId).toBe(3249);
  });
});
