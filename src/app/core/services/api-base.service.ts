import { Injectable, Inject, Optional } from '@angular/core';
import { AppConfigService } from '../config/app-config.service';

@Injectable({ providedIn: 'root' })
export class ApiBaseService {
  constructor(private cfg: AppConfigService) {}

  // Absolute API base URL, aligned with the API_URL provider logic
  getApiBaseUrl(): string {
    const base = (this.cfg.getApiBaseUrl() || '/api').toString();
    const isAbs = /^https?:\/\//i.test(base);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const abs = isAbs ? base : `${origin}${base}`;
    return abs.replace(/\/$/, '');
  }

  // Absolute Auth base URL, aligned with AppConfigService.getAuthBaseUrl()
  getAuthBaseUrl(): string {
    const base = (this.cfg.getAuthBaseUrl() || '').toString();
    const isAbs = /^https?:\/\//i.test(base);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const abs = isAbs ? base : `${origin}${base}`;
    return abs.replace(/\/$/, '');
  }

  // Compose a full URL from base + resource path
  buildUrl(path: string): string {
    const p = (path || '').trim();
    const base = this.getApiBaseUrl();
    if (!p) return base;
    return `${base}${p.startsWith('/') ? '' : '/'}${p}`;
  }
}

