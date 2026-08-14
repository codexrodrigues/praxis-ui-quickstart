import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_URL } from '@praxisui/core';

/**
 * Sends the host-managed HttpOnly session only to the configured Praxis API origin.
 * Corporate hosts normally replace the Quickstart login with their IdP/BFF while
 * preserving this same origin boundary.
 */
export const praxisApiCredentialsInterceptor: HttpInterceptorFn = (request, next) => {
  const apiUrl = inject(API_URL);
  const baseUrl = apiUrl['default']?.baseUrl;
  if (!baseUrl) return next(request);

  const documentOrigin = globalThis.location?.origin ?? baseUrl;
  const apiOrigin = new URL(baseUrl, documentOrigin).origin;
  const requestOrigin = new URL(request.url, documentOrigin).origin;
  return next(requestOrigin === apiOrigin ? request.clone({ withCredentials: true }) : request);
};
