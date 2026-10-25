import { HttpClient, HttpHeaders, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@praxisui/core';
import {
  praxisApiCredentialsInterceptor,
  resetPraxisApiXsrfCacheForTesting,
} from './praxis-api-credentials.interceptor';

describe('praxisApiCredentialsInterceptor', () => {
  beforeEach(() => {
    resetPraxisApiXsrfCacheForTesting();
  });

  it('sends credentials and captured X-XSRF-TOKEN only to the configured Praxis API origin', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([praxisApiCredentialsInterceptor])),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: { default: { baseUrl: 'https://api.example.test/api' } } },
      ],
    });
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);

    http.get('https://api.example.test/auth/session').subscribe();
    const sessionReq = controller.expectOne('https://api.example.test/auth/session');
    expect(sessionReq.request.withCredentials).toBeTrue();
    expect(sessionReq.request.headers.has('X-XSRF-TOKEN')).toBeFalse();
    sessionReq.flush(null, { headers: new HttpHeaders({ 'X-XSRF-TOKEN': 'csrf-token-123' }) });

    http.post('https://api.example.test/api/human-resources/folhas-pagamento', {}).subscribe();
    const postReq = controller.expectOne('https://api.example.test/api/human-resources/folhas-pagamento');
    expect(postReq.request.withCredentials).toBeTrue();
    expect(postReq.request.headers.get('X-XSRF-TOKEN')).toBe('csrf-token-123');
    postReq.flush({});

    http.get('https://api.example.test/schemas/filtered?path=/api/human-resources/folhas-pagamento/{id}&operation=put&schemaType=request').subscribe();
    const schemaReq = controller.expectOne(
      'https://api.example.test/schemas/filtered?path=/api/human-resources/folhas-pagamento/%7Bid%7D&operation=put&schemaType=request',
    );
    expect(schemaReq.request.withCredentials).toBeTrue();
    schemaReq.flush({});

    http.post('https://unrelated.example.test/data', {}).subscribe();
    const unrelatedReq = controller.expectOne('https://unrelated.example.test/data');
    expect(unrelatedReq.request.withCredentials).toBeFalse();
    expect(unrelatedReq.request.headers.has('X-XSRF-TOKEN')).toBeFalse();
    unrelatedReq.flush({});

    http.post('https://api.example.test/auth/logout', null).subscribe();
    const logoutReq = controller.expectOne('https://api.example.test/auth/logout');
    expect(logoutReq.request.headers.get('X-XSRF-TOKEN')).toBe('csrf-token-123');
    logoutReq.flush(null, { status: 204, statusText: 'No Content' });

    http.post('https://api.example.test/api/human-resources/folhas-pagamento', {}).subscribe();
    const postAfterLogoutReq = controller.expectOne('https://api.example.test/api/human-resources/folhas-pagamento');
    expect(postAfterLogoutReq.request.headers.has('X-XSRF-TOKEN')).toBeFalse();
    postAfterLogoutReq.flush({});

    controller.verify();
  });
});
