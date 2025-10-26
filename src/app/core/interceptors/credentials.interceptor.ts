import { HttpInterceptorFn } from '@angular/common/http';

// Garante que cookies (SESSION, XSRF-TOKEN) sejam enviados em produção
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const r = req.withCredentials ? req : req.clone({ withCredentials: true });
  // Debug hint (kept lightweight to avoid noise): flag auth calls in dev tools
  if (r.url.includes('/auth/')) {
    // eslint-disable-next-line no-console
    console.debug('[HTTP] withCredentials', r.method, r.url);
  }
  return next(r);
};
