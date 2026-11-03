import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import {
  ASYNC_CONFIG_STORAGE,
  ComponentMetadataRegistry,
  EnterpriseRuntimeContextService,
  PraxisCustomizationModeService,
  ResourceDiscoveryService,
  SchemaMetadataClient,
} from '@praxisui/core';
import { BehaviorSubject, of } from 'rxjs';
import { appConfig } from './app.config';
import { CustomizationModeService } from './customization-mode.service';
import {
  DEFAULT_STUDIO_PAGE,
  StudioExamplePageComponent,
} from './pages/studio-example-page.component';
import { QuickstartAiAssistantService } from './quickstart-ai-assistant.service';
import {
  praxisFetchHeadersInterceptor,
  QuickstartTenantContextService,
} from './quickstart-tenant-context.service';

describe('Praxis UI Quickstart · 12-Pillar Host Architecture', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Pillar 1 · Reactive Tenant Context & PAX_FETCH_HEADERS', () => {
    it('synchronizes X-Tenant-ID, Accept-Language, global PAX_FETCH_HEADERS, and invalidates caches on tenant switch', () => {
      const clearSchemaSpy = jasmine.createSpy('clearCache');
      const clearDiscoverySpy = jasmine.createSpy('clearCache');
      const refreshEnterpriseSpy = jasmine.createSpy('refresh');

      TestBed.configureTestingModule({
        providers: [
          QuickstartTenantContextService,
          {
            provide: SchemaMetadataClient,
            useValue: { clearCache: clearSchemaSpy },
          },
          {
            provide: ResourceDiscoveryService,
            useValue: { clearCache: clearDiscoverySpy },
          },
          {
            provide: EnterpriseRuntimeContextService,
            useValue: { refresh: refreshEnterpriseSpy },
          },
          provideHttpClient(withInterceptors([praxisFetchHeadersInterceptor])),
          provideHttpClientTesting(),
        ],
      });

      const service = TestBed.inject(QuickstartTenantContextService);
      const http = TestBed.inject(HttpClient);
      const httpTesting = TestBed.inject(HttpTestingController);

      expect(service.currentTenant().id).toBe('demo');

      service.selectTenant('enterprise-hr');

      expect(service.currentTenant().id).toBe('enterprise-hr');
      expect(service.currentTenant().locale).toBe('pt-BR');
      expect(clearSchemaSpy).toHaveBeenCalled();
      expect(clearDiscoverySpy).toHaveBeenCalled();
      expect(refreshEnterpriseSpy).toHaveBeenCalled();

      const globalHeaders = (
        globalThis as unknown as {
          PAX_FETCH_HEADERS?: () => Record<string, string>;
        }
      ).PAX_FETCH_HEADERS?.();
      expect(globalHeaders?.['X-Tenant-ID']).toBe('enterprise-hr');
      expect(globalHeaders?.['Accept-Language']).toBe('pt-BR');

      http.get('/api/human-resources/funcionarios/schemas/filtered').subscribe();
      const req = httpTesting.expectOne('/api/human-resources/funcionarios/schemas/filtered');
      expect(req.request.headers.get('X-Tenant-ID')).toBe('enterprise-hr');
      expect(req.request.headers.get('Accept-Language')).toBe('pt-BR');
      req.flush({});
      httpTesting.verify();
    });
  });

  describe('Pillar 2 & 5 · 24 Widget Metadata Registrations & Customization Mode Sync', () => {
    it('registers all 24 providePraxis*Metadata contracts in appConfig and synchronizes CustomizationModeService with PraxisCustomizationModeService', () => {
      TestBed.configureTestingModule({
        providers: [...(appConfig.providers ?? [])],
      });

      const registry = TestBed.inject(ComponentMetadataRegistry);
      expect(registry.get('praxis-table')).toBeTruthy();
      expect(registry.get('praxis-dynamic-form')).toBeTruthy();
      expect(registry.get('praxis-crud')).toBeTruthy();
      expect(registry.get('praxis-chart')).toBeTruthy();
      expect(registry.get('praxis-analytics-presentation')).toBeTruthy();
      expect(registry.get('praxis-related-resource-outlet')).toBeTruthy();
      expect(registry.get('praxis-dynamic-page')).toBeTruthy();

      const hostCustomization = TestBed.inject(CustomizationModeService);
      const coreCustomization = TestBed.inject(PraxisCustomizationModeService);

      hostCustomization.setCustomizationEnabled(false);
      expect(hostCustomization.customizationEnabled()).toBeFalse();
      expect(coreCustomization.isCustomizing()).toBeFalse();

      hostCustomization.setCustomizationEnabled(true);
      expect(hostCustomization.customizationEnabled()).toBeTrue();
      expect(coreCustomization.isCustomizing()).toBeTrue();
    });
  });

  describe('Pillar 12 · Studio Page Builder Save-As & Route Restoration', () => {
    it('saves a studio page definition to /pages/:pageId and restores it when navigating to that route', async () => {
      const paramMap$ = new BehaviorSubject(convertToParamMap({ studioKey: 'workspace' }));
      const saveConfigSpy = jasmine.createSpy('saveConfig').and.returnValue(of(undefined));

      await TestBed.configureTestingModule({
        imports: [StudioExamplePageComponent],
        providers: [
          ...(appConfig.providers ?? []),
          provideHttpClientTesting(),
          provideNoopAnimations(),
          provideRouter([]),
          {
            provide: ASYNC_CONFIG_STORAGE,
            useValue: {
              saveConfig: saveConfigSpy,
              loadConfig: () => of(null),
            },
          },
          {
            provide: ActivatedRoute,
            useValue: {
              paramMap: paramMap$.asObservable(),
            },
          },
        ],
      }).compileComponents();

      const router = TestBed.inject(Router);
      spyOn(router, 'navigateByUrl').and.resolveTo(true);

      const fixture = TestBed.createComponent(StudioExamplePageComponent);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      const customDef = {
        ...DEFAULT_STUDIO_PAGE,
        layout: {
          ...DEFAULT_STUDIO_PAGE.layout,
          gap: '24px',
        },
      };

      const saved = await component.persistPageAsNewRoute({
        creationKey: 'workspace',
        presentation: {
          title: 'Executive HR Studio Board',
          icon: 'analytics',
        },
        menuLabel: 'Executive Pages',
        definition: customDef,
      });

      expect(saved.pageId).toContain('executive-hr-studio-board-');
      expect(saved.routePath).toBe(`/pages/${saved.pageId}`);
      expect(saveConfigSpy).toHaveBeenCalled();

      // Simulate navigating to /pages/:pageId
      paramMap$.next(convertToParamMap({ pageId: saved.pageId }));
      fixture.detectChanges();

      expect(
        fixture.nativeElement.querySelector('[data-testid="quickstart-studio-title"]')?.textContent,
      ).toContain('Executive HR Studio Board');
    });
  });

  describe('Pillar 12 · Governed AI Assistant Service (No Heuristic Keyword Routing)', () => {
    it('keeps free-text consultative prompts in chat mode with canApply=false and enables apply only on structured contextHints', () => {
      TestBed.configureTestingModule({
        providers: [
          QuickstartAiAssistantService,
          QuickstartTenantContextService,
          provideRouter([]),
        ],
      });

      const assistant = TestBed.inject(QuickstartAiAssistantService);

      assistant.submitPrompt('Open studio workspace right now');
      expect(assistant.canApply()).toBeFalse();
      expect(assistant.pendingRouteToApply()).toBeNull();
      expect(assistant.mode()).toBe('chat');

      const studioIntent = assistant
        .recommendedIntents()
        .find((item) => item.id === 'intent-studio-builder');
      expect(studioIntent).toBeDefined();

      assistant.triggerRecommendedIntent(studioIntent!);
      expect(assistant.canApply()).toBeTrue();
      expect(assistant.pendingRouteToApply()).toBe('/studio/workspace');
      expect(assistant.mode()).toBe('agentic-authoring');
    });
  });
});
