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

  // Para evitar discrepâncias entre apps, padronizamos auth sob a mesma base de API
  // Ex.: /api/auth/login (em dev via proxy e em prod via URL absoluta)
  getAuthBaseUrl(): string {
    return this.getApiBaseUrl();
  }
}
