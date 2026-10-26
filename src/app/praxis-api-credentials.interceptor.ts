import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_URL } from '@praxisui/core';
import { tap } from 'rxjs';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE']);
const xsrfTokenByOrigin = new Map<string, string>();

function readCookie(name: string): string | null {
  const cookieSource = globalThis.document?.cookie;
  if (!cookieSource) return null;
  for (const part of cookieSource.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.slice(name.length + 1));
    }
  }
  return null;
}

export function resetPraxisApiXsrfCacheForTesting(): void {
  xsrfTokenByOrigin.clear();
}

/**
 * Sends the host-managed HttpOnly session and CSRF header only to the configured
 * Praxis API origin. Corporate hosts normally replace the Quickstart login with
 * their IdP/BFF while preserving this same origin boundary.
 */
export const praxisApiCredentialsInterceptor: HttpInterceptorFn = (request, next) => {
  const apiUrl = inject(API_URL);
  const baseUrl = apiUrl['default']?.baseUrl;
  if (!baseUrl) return next(request);

  const documentOrigin = globalThis.location?.origin ?? baseUrl;
  const apiOrigin = new URL(baseUrl, documentOrigin).origin;
  const requestUrl = new URL(request.url, documentOrigin);
  if (requestUrl.origin !== apiOrigin) {
    return next(request);
  }

  const method = request.method.toUpperCase();
  const xsrfToken = xsrfTokenByOrigin.get(apiOrigin) ?? readCookie('XSRF-TOKEN');
  const shouldAttachXsrf = !SAFE_METHODS.has(method) && !!xsrfToken && !request.headers.has('X-XSRF-TOKEN');
  const normalizedUrl =
    request.url.includes('{') || request.url.includes('}')
      ? request.url.replaceAll('{', '%7B').replaceAll('}', '%7D')
      : request.url;
  const forwarded = request.clone({
    url: normalizedUrl,
    withCredentials: true,
    setHeaders: shouldAttachXsrf ? { 'X-XSRF-TOKEN': xsrfToken } : undefined,
  });

  const isLogout = requestUrl.pathname.endsWith('/auth/logout');
  return next(forwarded).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          if (isLogout) {
            xsrfTokenByOrigin.delete(apiOrigin);
            return;
          }
          const headerToken = event.headers.get('X-XSRF-TOKEN');
          if (headerToken) {
            xsrfTokenByOrigin.set(apiOrigin, headerToken);
          }
        }
      },
      error: (error: unknown) => {
        if (isLogout) {
          xsrfTokenByOrigin.delete(apiOrigin);
          return;
        }
        if (error instanceof HttpErrorResponse) {
          const headerToken = error.headers?.get('X-XSRF-TOKEN');
          if (headerToken) {
            xsrfTokenByOrigin.set(apiOrigin, headerToken);
          }
        }
      },
    }),
  );
};
