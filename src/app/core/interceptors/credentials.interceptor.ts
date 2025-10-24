import { HttpInterceptorFn } from '@angular/common/http';

// Garante que cookies (SESSION, XSRF-TOKEN) sejam enviados em produção
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.withCredentials) return next(req);
  return next(req.clone({ withCredentials: true }));
};

