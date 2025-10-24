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

  login(payload: LoginPayload): Observable<boolean> {
    // Padroniza sob /api quando disponível: /api/auth/login
    const authBase = this.appConfig.getAuthBaseUrl() || environment.apiBaseUrl || '';
    const base = String(authBase).replace(/\/$/, '');
    const authUrl = base ? `${base}/auth/login` : '/api/auth/login';
    return this.http.post<void>(authUrl, payload, { observe: 'response' }).pipe(
      map(res => res.status >= 200 && res.status < 300),
      tap(ok => { if (ok) this._isAuthenticated$.next(true); }),
      catchError(() => of(false))
    );
  }

  logout(): Observable<boolean> {
    const authBase = this.appConfig.getAuthBaseUrl() || environment.apiBaseUrl || '';
    const base = String(authBase).replace(/\/$/, '');
    const authUrl = base ? `${base}/auth/logout` : '/api/auth/logout';
    return this.http.post<void>(authUrl, {}, { observe: 'response' }).pipe(
      map(() => true),
      tap(() => this._isAuthenticated$.next(false)),
      catchError(() => of(false))
    );
  }

  // Faz um ping em um endpoint protegido para verificar sessão por cookie
  checkSession(): Observable<boolean> {
    // Use um endpoint realmente protegido da API para validar o cookie
    const apiBase = this.appConfig.getApiBaseUrl() || (environment.apiBaseUrl ?? '');
    const base = String(apiBase).replace(/\/$/, '');
    return this.http.get(`${base}/human-resources/bases/all`, { observe: 'response' }).pipe(
      map(res => res.status >= 200 && res.status < 300),
      tap(() => this._isAuthenticated$.next(true)),
      catchError(() => { this._isAuthenticated$.next(false); return of(false); })
    );
  }
}
