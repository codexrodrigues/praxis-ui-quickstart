import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { APP_ROUTES } from './app/app.routes';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { firebaseConfig } from './app/core/firebase/firebase.config';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(APP_ROUTES),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
    ),
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
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
