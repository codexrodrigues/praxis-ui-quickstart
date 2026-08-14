import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { API_URL, GenericCrudService } from '@praxisui/core';
import { PraxisDynamicForm, providePraxisDynamicFormMetadata } from '@praxisui/dynamic-form';
import { ReactiveDeterminationDiagnosticsComponent } from '@praxisui/metadata-editor';
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

    http
      .expectOne(
        '/schemas/filtered?path=/api/human-resources/enderecos&operation=post&schemaType=request',
      )
      .flush({ 'x-ui': { reactiveDeterminations: [{ id: 'address' }] } });
    http
      .expectOne(
        '/schemas/filtered?path=/api/human-resources/folhas-pagamento&operation=post&schemaType=request',
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

    http.verify();
  });
});
