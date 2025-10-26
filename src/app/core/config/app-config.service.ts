import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface AppRuntimeConfig {
  apiBaseUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private cfg: AppRuntimeConfig = { apiBaseUrl: '/api' };

  async load(): Promise<void> {
    // Loads runtime config. In production, prefer app-config.prod.json
    const file = environment.production ? 'app-config.prod.json' : 'app-config.json';
    const url = `assets/${file}?v=${Date.now()}`;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as AppRuntimeConfig;
        this.cfg = { ...this.cfg, ...data };
      }
    } catch {
      // keep defaults
    }
  }

  getApiBaseUrl(): string {
    return (this.cfg.apiBaseUrl ?? '').toString();
  }

  // Auth base: em dev usamos "/api" (proxy reescreve /api/auth → /auth);
  // em produção, se apiBaseUrl terminar com "/api", removemos o sufixo para chamar "/auth/*" na raiz.
  getAuthBaseUrl(): string {
    const api = (this.getApiBaseUrl() || '').toString();
    // API absoluta (https://host/...)
    if (/^https?:\/\//i.test(api)) {
      return api.replace(/\/+$/, '').replace(/\/(api)$/i, '');
    }
    // API relativa "/api" (dev)
    if (api.replace(/\/+$/, '') === '/api') {
      return '';
    }
    return api;
  }
}
