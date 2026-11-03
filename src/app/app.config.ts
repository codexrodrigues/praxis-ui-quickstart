import {
  AI_BACKEND_STORAGE_OPTIONS,
  PRAXIS_ASSISTANT_VOICE_INPUT_MODE,
} from '@praxisui/ai';
import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  LowerCasePipe,
  PercentPipe,
  TitleCasePipe,
  UpperCasePipe,
} from '@angular/common';
import {
  HttpErrorResponse,
  HttpHeaders,
  HttpInterceptorFn,
  HttpResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { catchError, of, throwError } from 'rxjs';
import {
  providePraxisAnalyticsPresentationMetadata,
  providePraxisCharts,
  providePraxisChartsI18n,
  providePraxisChartsMetadata,
  providePraxisMicroVisualizationMetadata,
} from '@praxisui/charts';
import {
  API_CONFIG_STORAGE_OPTIONS,
  type ApiConfigStorageOptions,
  API_URL,
  type ApiUrlConfig,
  ASYNC_CONFIG_STORAGE,
  ApiConfigStorage,
  DomainRuleService,
  GenericCrudService,
  GlobalActionService,
  provideGlobalConfig,
  provideGlobalConfigReady,
  provideGlobalConfigSeed,
  providePraxisDynamicPageMetadata,
  providePraxisFooterLinksMetadata,
  providePraxisHeroBannerMetadata,
  providePraxisHttpCollectionExportProvider,
  providePraxisIconDefaults,
  providePraxisLegalNoticeMetadata,
  providePraxisLoadingDefaults,
  providePraxisRelatedResourceOutletMetadata,
  providePraxisRichTextBlockMetadata,
  providePraxisUserContextSummaryMetadata,
  withPraxisHttpLoading,
} from '@praxisui/core';
import { CRUD_AI_CAPABILITIES, providePraxisCrudMetadata } from '@praxisui/crud';
import {
  providePraxisDialogGlobalActions,
  providePraxisDialogMetadata,
  providePraxisQuickViewDialogPresenter,
  providePraxisSurfaceGlobalActions,
} from '@praxisui/dialog';
import { providePraxisDynamicFieldsCore } from '@praxisui/dynamic-fields';
import {
  FORM_AI_CAPABILITIES,
  PraxisDynamicForm,
  providePraxisDynamicFormMetadata,
  providePraxisFilterFormMetadata,
} from '@praxisui/dynamic-form';
import { providePraxisExpansionMetadata } from '@praxisui/expansion';
import { providePraxisFilesUploadMetadata } from '@praxisui/files-upload';
import { LIST_AI_CAPABILITIES, providePraxisListMetadata } from '@praxisui/list';
import { providePraxisMetadataEditorMetadata } from '@praxisui/metadata-editor';
import {
  PAGE_BUILDER_AGENTIC_AUTHORING_OPTIONS,
  PAGE_BUILDER_WIDGET_AI_CATALOGS,
  providePageBuilderWidgetAiCatalogs,
  providePraxisPageBuilderMetadata,
} from '@praxisui/page-builder';
import {
  providePraxisQuickViewRichContentRenderer,
  providePraxisRichContentMetadata,
} from '@praxisui/rich-content';
import {
  GLOBAL_CONFIG_DYNAMIC_FORM_COMPONENT,
  providePraxisSettingsPanelBridge,
  providePraxisSurfaceDrawerBridge,
} from '@praxisui/settings-panel';
import { providePraxisStepperMetadata } from '@praxisui/stepper';
import {
  TABLE_AI_CAPABILITIES,
  providePraxisFilterMetadata,
  providePraxisTableMetadata,
} from '@praxisui/table';
import { providePraxisTabsMetadata } from '@praxisui/tabs';
import { routes } from './app.routes';
import { praxisApiCredentialsInterceptor } from './praxis-api-credentials.interceptor';
import { GLOBAL_CONFIG_SEED, PRAXIS_API_BASE_URL } from './quickstart-platform-config';
import {
  QuickstartTenantContextService,
  praxisFetchHeadersInterceptor,
} from './quickstart-tenant-context.service';
import { SiteAnalyticsService } from './site-analytics.service';

const API_URL_VALUE: ApiUrlConfig = {
  default: { baseUrl: PRAXIS_API_BASE_URL },
};

/**
 * Resilient local fallback for `/praxis/config/ui` when the public Quickstart backend
 * returns 0/401/403/404/502/503/504 for anonymous visitors, preserving the ETag contract
 * expected by `ApiConfigStorage`.
 */
export const quickstartConfigLocalFallbackInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/praxis/config/ui')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }
      const fallbackStatuses = new Set([0, 401, 403, 404, 502, 503, 504]);
      if (!fallbackStatuses.has(error.status) || typeof localStorage === 'undefined') {
        return throwError(() => error);
      }

      const tenant = req.headers.get('X-Tenant-ID') || localStorage.getItem('pax.api.tenant') || 'demo';
      let componentId = 'default';
      try {
        const parsedUrl = new URL(req.urlWithParams, 'http://localhost');
        componentId =
          parsedUrl.searchParams.get('key') ||
          parsedUrl.pathname.split('/praxis/config/ui/')[1] ||
          'default';
      } catch {
        componentId = 'default';
      }
      const storageKey = `praxis:quickstart-ui-config:${tenant}:${componentId}`;

      if (req.method === 'GET') {
        const raw = localStorage.getItem(storageKey);
        if (!raw) {
          return throwError(() => error);
        }
        try {
          const record = JSON.parse(raw) as {
            payload: unknown;
            scope: string;
            version: number;
            etag: string;
          };
          return of(
            new HttpResponse({
              status: 200,
              url: req.urlWithParams,
              headers: new HttpHeaders({ ETag: record.etag || `W/"${record.version || 1}"` }),
              body: record,
            }),
          );
        } catch {
          return throwError(() => error);
        }
      }

      if (req.method === 'PUT' || req.method === 'POST') {
        const incomingBody =
          typeof req.body === 'string'
            ? (JSON.parse(req.body) as Record<string, unknown>)
            : ((req.body ?? {}) as Record<string, unknown>);
        const payload =
          incomingBody && typeof incomingBody === 'object' && 'payload' in incomingBody
            ? incomingBody['payload']
            : incomingBody;
        const record = {
          payload,
          scope: 'user',
          version: 1,
          etag: 'W/"1"',
        };
        try {
          localStorage.setItem(storageKey, JSON.stringify(record));
        } catch {
          /* ignore storage quota errors */
        }
        return of(
          new HttpResponse({
            status: 200,
            url: req.urlWithParams,
            headers: new HttpHeaders({ ETag: record.etag }),
            body: record,
          }),
        );
      }

      if (req.method === 'DELETE') {
        localStorage.removeItem(storageKey);
        return of(new HttpResponse({ status: 204, url: req.urlWithParams }));
      }

      return throwError(() => error);
    }),
  );
};

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: PRAXIS_ASSISTANT_VOICE_INPUT_MODE, useValue: 'governed-transcription' },
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient(
      withPraxisHttpLoading(),
      withInterceptors([
        praxisFetchHeadersInterceptor,
        praxisApiCredentialsInterceptor,
        quickstartConfigLocalFallbackInterceptor,
      ]),
    ),
    ...providePraxisDynamicFieldsCore(),
    ...providePraxisIconDefaults(),
    ...providePraxisLoadingDefaults(),
    ...providePraxisHttpCollectionExportProvider(),

    // Pilar 3 — Catálogo Completo de 23 Providers de Metadados de Widgets
    providePraxisCrudMetadata(),
    providePraxisTableMetadata(),
    providePraxisFilterMetadata(),
    providePraxisDynamicFormMetadata(),
    providePraxisFilterFormMetadata(),
    providePraxisChartsMetadata(),
    providePraxisAnalyticsPresentationMetadata(),
    providePraxisMicroVisualizationMetadata(),
    providePraxisListMetadata(),
    providePraxisRichContentMetadata(),
    providePraxisTabsMetadata(),
    providePraxisExpansionMetadata(),
    providePraxisStepperMetadata(),
    providePraxisHeroBannerMetadata(),
    providePraxisUserContextSummaryMetadata(),
    providePraxisRelatedResourceOutletMetadata(),
    providePraxisRichTextBlockMetadata(),
    providePraxisFooterLinksMetadata(),
    providePraxisLegalNoticeMetadata(),
    providePraxisDynamicPageMetadata(),
    providePraxisFilesUploadMetadata(),
    providePraxisMetadataEditorMetadata(),
    providePraxisDialogMetadata(),
    providePraxisPageBuilderMetadata(),

    // Pilar 2 — Bridges Globais 360°, Drawers e Settings Panel (Zero Custom Surface Openers)
    providePraxisDialogGlobalActions(),
    providePraxisQuickViewDialogPresenter(),
    providePraxisQuickViewRichContentRenderer(),
    providePraxisSurfaceGlobalActions(),
    ...providePraxisSurfaceDrawerBridge(),
    ...providePraxisSettingsPanelBridge(),
    {
      provide: GLOBAL_CONFIG_DYNAMIC_FORM_COMPONENT,
      useValue: PraxisDynamicForm,
    },

    // Pilar 11 — Analytics & Charts Runtime
    ...providePraxisCharts(),
    ...providePraxisChartsI18n({ locale: 'en-US', fallbackLocale: 'en-US' }),

    importProvidersFrom(MatDialogModule),
    { provide: API_URL, useValue: API_URL_VALUE },
    GenericCrudService,
    GlobalActionService,

    // Pilar 4 — Configurações Globais e Persistência Remota (ApiConfigStorage)
    provideGlobalConfig(GLOBAL_CONFIG_SEED),
    provideGlobalConfigSeed(GLOBAL_CONFIG_SEED),
    provideGlobalConfigReady(),
    {
      provide: ASYNC_CONFIG_STORAGE,
      useExisting: ApiConfigStorage,
    },
    {
      provide: API_CONFIG_STORAGE_OPTIONS,
      useValue: {
        baseUrl: `${PRAXIS_API_BASE_URL}/praxis/config/ui`,
        errorPolicy: 'fail',
        headersFactory: () => {
          const tenant =
            typeof localStorage !== 'undefined'
              ? localStorage.getItem('pax.api.tenant') || 'demo'
              : 'demo';
          return {
            'X-Tenant-ID': tenant,
            'X-Tenant': tenant,
            'X-Env': 'local',
          };
        },
      } satisfies ApiConfigStorageOptions,
    },

    // Pilar 12 — Assistente de IA In-App (@praxisui/ai) e Catálogo de Capacidades IA do Page Builder
    {
      provide: PAGE_BUILDER_WIDGET_AI_CATALOGS,
      useValue: {
        'praxis-table': TABLE_AI_CAPABILITIES,
        'praxis-crud': CRUD_AI_CAPABILITIES,
        'praxis-dynamic-form': FORM_AI_CAPABILITIES,
        'praxis-list': LIST_AI_CAPABILITIES,
      },
    },
    providePageBuilderWidgetAiCatalogs(),
    {
      provide: AI_BACKEND_STORAGE_OPTIONS,
      useValue: {
        headersFactory: () => {
          const tenant =
            typeof localStorage !== 'undefined'
              ? localStorage.getItem('pax.api.tenant') || 'demo'
              : 'demo';
          return {
            'X-Tenant-ID': tenant,
            'X-Tenant': tenant,
            'X-Env': 'local',
          };
        },
      },
    },
    {
      provide: PAGE_BUILDER_AGENTIC_AUTHORING_OPTIONS,
      useFactory: () => {
        const domainRules = inject(DomainRuleService, { optional: true });
        return {
          baseUrl: `${PRAXIS_API_BASE_URL}/praxis/config/ai/authoring`,
          ...(domainRules
            ? {
                sharedRuleIntake: (request: any, options?: { headers?: Record<string, string> }) =>
                  domainRules.intake(request, options),
              }
            : {}),
          headersFactory: () => {
            const tenant =
              typeof localStorage !== 'undefined'
                ? localStorage.getItem('pax.api.tenant') || 'demo'
                : 'demo';
            return {
              'X-Tenant-ID': tenant,
              'X-Tenant': tenant,
              'X-Env': 'local',
            };
          },
        };
      },
    },

    DatePipe,
    DecimalPipe,
    CurrencyPipe,
    PercentPipe,
    UpperCasePipe,
    LowerCasePipe,
    TitleCasePipe,
    provideEnvironmentInitializer(() => {
      inject(QuickstartTenantContextService).syncGlobalFetchHeaders();
      inject(SiteAnalyticsService).initialize();
    }),
  ],
};
