import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@praxisui/core';
import { praxisApiCredentialsInterceptor } from './praxis-api-credentials.interceptor';

describe('praxisApiCredentialsInterceptor', () => {
  it('sends credentials only to the configured Praxis API origin', () => {
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
    expect(controller.expectOne('https://api.example.test/auth/session').request.withCredentials)
      .toBeTrue();

    http.get('https://unrelated.example.test/data').subscribe();
    expect(controller.expectOne('https://unrelated.example.test/data').request.withCredentials)
      .toBeFalse();
    controller.verify();
  });
});
