import { HttpInterceptorFn } from '@angular/common/http';

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const prefix = `${name}=`;
  const parts = document.cookie.split(';');
  for (const p of parts) {
    const v = p.trim();
    if (v.startsWith(prefix)) return decodeURIComponent(v.substring(prefix.length));
  }
  return undefined;
}

// Adiciona X-XSRF-TOKEN a partir do cookie XSRF-TOKEN em métodos não seguros
export const xsrfInterceptor: HttpInterceptorFn = (req, next) => {
  const method = (req.method || 'GET').toUpperCase();
  const unsafe = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';
  if (!unsafe) return next(req);

  if (!req.headers.has('X-XSRF-TOKEN')) {
    const token = readCookie('XSRF-TOKEN');
    if (token) {
      const nextReq = req.clone({ setHeaders: { 'X-XSRF-TOKEN': token } });
      return next(nextReq);
    }
  }
  return next(req);
};

