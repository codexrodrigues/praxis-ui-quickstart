import { ApplicationConfig, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { APP_ROUTES } from './app.routes';
import { credentialsInterceptor } from './core/interceptors/credentials.interceptor';
import { xsrfInterceptor } from './core/interceptors/xsrf.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { AppConfigService } from './core/config/app-config.service';
import {
  provideGlobalConfigTenant,
  provideGlobalConfigSeed,
  provideRemoteGlobalConfig,
  provideGlobalConfig,
  GenericCrudService,
  API_URL,
  type ApiUrlConfig,
} from '@praxisui/core';
import { DatePipe, DecimalPipe, CurrencyPipe, PercentPipe, UpperCasePipe, LowerCasePipe, TitleCasePipe } from '@angular/common';
import { providePraxisTableMetadata, FILTER_DRAWER_ADAPTER } from '@praxisui/table';
import { providePraxisListMetadata } from '@praxisui/list';
import { providePraxisDynamicFormMetadata } from '@praxisui/dynamic-form';
import { providePraxisCrudMetadata } from '@praxisui/crud';
import { CRUD_DRAWER_ADAPTER } from '@praxisui/crud';
import { HostCrudDrawerAdapter } from './core/crud-drawer/host-crud-drawer.adapter';
import { HostFilterDrawerAdapter } from './core/filter-drawer/host-filter-drawer.adapter';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(APP_ROUTES),
    provideHttpClient(
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
      withInterceptors([credentialsInterceptor, xsrfInterceptor, loadingInterceptor]),
    ),
    GenericCrudService,
    // Formatting pipes required by Praxis Table's DataFormattingService
    DatePipe, DecimalPipe, CurrencyPipe, PercentPipe, UpperCasePipe, LowerCasePipe, TitleCasePipe,
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const svc = inject(AppConfigService);
        return () => svc.load();
      },
    },
    provideAnimations(),

    // Praxis — providers e integrações
    providePraxisTableMetadata(),
    providePraxisListMetadata(),
    providePraxisDynamicFormMetadata(),
    providePraxisCrudMetadata(),
    { provide: CRUD_DRAWER_ADAPTER, useClass: HostCrudDrawerAdapter },
    { provide: FILTER_DRAWER_ADAPTER, useClass: HostFilterDrawerAdapter },
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        // Load core library (lighter) and register only the languages we use
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        languages: {
          typescript: () => import('highlight.js/lib/languages/typescript'),
          xml: () => import('highlight.js/lib/languages/xml'),
          json: () => import('highlight.js/lib/languages/json'),
        },
        lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'),
      },
    },
    {
      provide: API_URL,
      deps: [AppConfigService],
      useFactory: (cfg: AppConfigService): ApiUrlConfig => {
        const base = (cfg.getApiBaseUrl() || '/api').toString();
        const absolute = /^https?:\/\//i.test(base)
          ? base
          : `${(typeof window !== 'undefined' ? window.location.origin : '')}${base}`;
        return { default: { baseUrl: absolute } } as ApiUrlConfig;
      },
    },

    // Global Config (safe defaults — can be overridden by remote or runtime)
    provideGlobalConfigTenant('tenant-default'),
    provideGlobalConfigSeed({ table: { filteringUi: { advancedOpenMode: 'drawer' } } }),
    provideRemoteGlobalConfig('/assets/global-config.json'),
    provideGlobalConfig({ crud: { defaults: { openMode: 'modal' } } }),
  ],
};
