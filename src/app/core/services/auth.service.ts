import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AppConfigService } from '../config/app-config.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface LoginPayload { username: string; password: string }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private appConfig = inject(AppConfigService);

  private _isAuthenticated$ = new BehaviorSubject<boolean>(false);
  readonly isAuthenticated$ = this._isAuthenticated$.asObservable();
  private _username$ = new BehaviorSubject<string | null>(null);
  readonly username$ = this._username$.asObservable();

  login(payload: LoginPayload): Observable<boolean> {
    // Padroniza sob /api quando disponível: /api/auth/login
    const authBase = this.appConfig.getAuthBaseUrl() || environment.apiBaseUrl || '';
    const base = String(authBase).replace(/\/$/, '');
    const authUrl = base ? `${base}/auth/login` : '/api/auth/login';
    return this.http.post<void>(authUrl, payload, { observe: 'response' }).pipe(
      map(res => res.status >= 200 && res.status < 300),
      tap(ok => {
        if (ok) {
          this._isAuthenticated$.next(true);
          this._username$.next(payload.username);
          try { localStorage.setItem('auth:lastUser', payload.username); } catch {}
        }
      }),
      catchError((err) => {
        // eslint-disable-next-line no-console
        console.warn('[Auth] Login failed', {
          url: authUrl,
          user: payload?.username,
          status: err?.status,
          statusText: err?.statusText,
          message: err?.message,
        });
        return of(false);
      })
    );
  }

  logout(): Observable<boolean> {
    const authBase = this.appConfig.getAuthBaseUrl() || environment.apiBaseUrl || '';
    const base = String(authBase).replace(/\/$/, '');
    const authUrl = base ? `${base}/auth/logout` : '/api/auth/logout';
    return this.http.post<void>(authUrl, {}, { observe: 'response' }).pipe(
      map(() => true),
      tap(() => {
        this._isAuthenticated$.next(false);
        this._username$.next(null);
        try { localStorage.removeItem('auth:lastUser'); } catch {}
      }),
      catchError(() => of(false))
    );
  }

  // Verifica sessão por cookie em endpoint dedicado (/auth/session)
  checkSession(): Observable<boolean> {
    const authBase = this.appConfig.getAuthBaseUrl() || environment.apiBaseUrl || '';
    const base = String(authBase).replace(/\/$/, '');
    // GET /auth/session → 204 quando autenticado
    return this.http.get(`${base}/auth/session`, { observe: 'response' }).pipe(
      map(res => res.status >= 200 && res.status < 300),
      tap(ok => {
        this._isAuthenticated$.next(!!ok);
        if (ok) {
          const last = (() => { try { return localStorage.getItem('auth:lastUser'); } catch { return null; } })();
          this._username$.next(last);
        } else {
          this._username$.next(null);
        }
      }),
      catchError(() => { this._isAuthenticated$.next(false); this._username$.next(null); return of(false); })
    );
  }
}
