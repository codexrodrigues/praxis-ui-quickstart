import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { APP_ROUTES } from './app/app.routes';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { firebaseConfig } from './app/core/firebase/firebase.config';
import { environment } from './environments/environment';
import { credentialsInterceptor } from './app/core/interceptors/credentials.interceptor';
import { xsrfInterceptor } from './app/core/interceptors/xsrf.interceptor';
import { AppConfigService } from './app/core/config/app-config.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(APP_ROUTES),
    provideHttpClient(
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
      withInterceptors([credentialsInterceptor, xsrfInterceptor]),
    ),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const svc = inject(AppConfigService);
        return () => svc.load();
      },
    },
    provideAnimations(),
  ],
}).catch((err) => console.error(err));

// Firebase (produção): inicializa app e Analytics somente no browser
try {
  if (environment.production) {
    const app = initializeApp(firebaseConfig);
    if (typeof window !== 'undefined' && 'measurementId' in firebaseConfig) {
      getAnalytics(app);
    }
  }
} catch (e) {
  console.warn('Firebase init skipped:', e);
}
// Interceptor de 401 removido para evitar conflitos de injeção em produção.
