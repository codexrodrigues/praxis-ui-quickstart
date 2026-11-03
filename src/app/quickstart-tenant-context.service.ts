import { HttpInterceptorFn } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import {
  EnterpriseRuntimeContextService,
  ResourceDiscoveryService,
  SchemaMetadataClient,
} from '@praxisui/core';

export interface QuickstartTenantOption {
  readonly id: string;
  readonly label: string;
  readonly badge: string;
  readonly locale: string;
}

export const QUICKSTART_TENANTS: readonly QuickstartTenantOption[] = [
  {
    id: 'demo',
    label: 'Demo Workforce',
    badge: 'DEMO',
    locale: 'en-US',
  },
  {
    id: 'enterprise-hr',
    label: 'Enterprise HR',
    badge: 'HR',
    locale: 'pt-BR',
  },
  {
    id: 'operations-hq',
    label: 'Operations HQ',
    badge: 'OPS',
    locale: 'en-US',
  },
];

const TENANT_STORAGE_KEY = 'pax.api.tenant';

@Injectable({ providedIn: 'root' })
export class QuickstartTenantContextService {
  private readonly schemaClient = inject(SchemaMetadataClient, { optional: true });
  private readonly resourceDiscovery = inject(ResourceDiscoveryService, { optional: true });
  private readonly enterpriseContext = inject(EnterpriseRuntimeContextService, { optional: true });

  readonly tenants = QUICKSTART_TENANTS;
  readonly activeTenantId = signal<string>(this.readInitialTenant());

  readonly currentTenant = computed<QuickstartTenantOption>(() => {
    const id = this.activeTenantId();
    return this.tenants.find((t) => t.id === id) ?? this.tenants[0];
  });

  constructor() {
    this.syncGlobalFetchHeaders();
  }

  selectTenant(tenantId: string): void {
    const matched = this.tenants.find((t) => t.id === tenantId) ?? this.tenants[0];
    if (matched.id === this.activeTenantId()) {
      return;
    }
    this.activeTenantId.set(matched.id);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(TENANT_STORAGE_KEY, matched.id);
      } catch {
        /* ignore storage quota errors */
      }
    }
    this.syncGlobalFetchHeaders();
    this.invalidateMetadataCaches();
  }

  setTenant(tenantId: string): void {
    this.selectTenant(tenantId);
  }

  buildHeaders(): Record<string, string> {
    const tenant = this.currentTenant();
    const token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('pax.api.token') || '' : '';
    const headers: Record<string, string> = {
      'X-Tenant-ID': tenant.id,
      'X-Tenant': tenant.id,
      'Accept-Language': tenant.locale || 'en-US',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  syncGlobalFetchHeaders(): void {
    (
      globalThis as unknown as {
        PAX_FETCH_HEADERS?: () => Record<string, string>;
      }
    ).PAX_FETCH_HEADERS = () => this.buildHeaders();
  }

  private invalidateMetadataCaches(): void {
    const schemaAny = this.schemaClient as unknown as {
      clearCache?: () => void;
      invalidateAll?: () => void;
    } | null;
    schemaAny?.clearCache?.();
    schemaAny?.invalidateAll?.();

    const discoveryAny = this.resourceDiscovery as unknown as {
      clearCache?: () => void;
      invalidateAll?: () => void;
    } | null;
    discoveryAny?.clearCache?.();
    discoveryAny?.invalidateAll?.();

    const enterpriseAny = this.enterpriseContext as unknown as {
      refresh?: () => void;
    } | null;
    enterpriseAny?.refresh?.();
  }

  private readInitialTenant(): string {
    if (typeof localStorage === 'undefined') {
      return 'demo';
    }
    try {
      const saved = localStorage.getItem(TENANT_STORAGE_KEY)?.trim();
      if (saved && QUICKSTART_TENANTS.some((t) => t.id === saved)) {
        return saved;
      }
    } catch {
      /* ignore storage access errors */
    }
    return 'demo';
  }
}

export const praxisFetchHeadersInterceptor: HttpInterceptorFn = (request, next) => {
  const tenantContext = inject(QuickstartTenantContextService);
  const dynamicHeaders = tenantContext.buildHeaders();
  const headersToApply: Record<string, string> = {};

  for (const [key, value] of Object.entries(dynamicHeaders)) {
    if (!request.headers.has(key)) {
      headersToApply[key] = value;
    }
  }

  if (Object.keys(headersToApply).length === 0) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: headersToApply,
    }),
  );
};
