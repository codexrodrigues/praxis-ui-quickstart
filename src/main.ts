import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { firebaseConfig } from './app/core/firebase/firebase.config';
import { environment } from './environments/environment';
bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));

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
