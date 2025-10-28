import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { GlobalLoadingService } from '../loading/global-loading.service';
import { AppConfigService } from '../config/app-config.service';

export function loadingInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const loader = inject(GlobalLoadingService);
  const cfg = inject(AppConfigService);

  // Determina se deve contar esta requisição
  const url = req.url || '';
  const isAsset = /\/assets\//.test(url);
  const isSchemas = /\/schemas(\/|$)/.test(url); // inclui /schemas/filtered

  // Consideramos back-end: /api/* e /schemas* (pois libs usam schemas/filtered)
  const base = (cfg.getApiBaseUrl() || '').toString().replace(/\/$/, '');
  const isApi = base && url.startsWith(base);
  const isRelativeApi = !/^https?:/i.test(url) && url.startsWith('/api/');
  const origin = (typeof window !== 'undefined' ? window.location.origin : '');
  // Cobre /auth relativos e absolutos (produção utiliza domínio absoluto de API)
  const authBase = (cfg.getAuthBaseUrl?.() || '').toString().replace(/\/$/, '');
  const isAuthRelative = !/^https?:/i.test(url) && url.startsWith('/auth');
  const isAuthSameOrigin = origin && url.startsWith(`${origin}/auth`);
  const isAuthAbsolute = authBase && /^https?:/i.test(authBase) && url.startsWith(`${authBase}/auth`);
  const isAuth = isAuthRelative || !!isAuthSameOrigin || !!isAuthAbsolute;

  const shouldTrack = (isApi || isRelativeApi || isSchemas || isAuth) && !isAsset && req.headers.get('X-Loader-Skip') !== 'true';

  if (shouldTrack) loader.start();
  return next(req).pipe(finalize(() => { if (shouldTrack) loader.stop(); }));
}
