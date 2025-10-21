import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface LoginPayload { username: string; password: string }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _isAuthenticated$ = new BehaviorSubject<boolean>(false);
  readonly isAuthenticated$ = this._isAuthenticated$.asObservable();

  login(payload: LoginPayload): Observable<boolean> {
    return this.http.post<void>('/auth/login', payload, { observe: 'response' }).pipe(
      map(res => res.status >= 200 && res.status < 300),
      tap(ok => { if (ok) this._isAuthenticated$.next(true); }),
      catchError(() => of(false))
    );
  }

  logout(): Observable<boolean> {
    return this.http.post<void>('/auth/logout', {}, { observe: 'response' }).pipe(
      map(() => true),
      tap(() => this._isAuthenticated$.next(false)),
      catchError(() => of(false))
    );
  }

  // Faz um ping em um endpoint protegido para verificar sessão por cookie
  checkSession(): Observable<boolean> {
    return this.http.get('/api/human-resources/habilidades', { params: { size: 1 } }).pipe(
      map(() => true),
      tap(() => this._isAuthenticated$.next(true)),
      catchError(() => { this._isAuthenticated$.next(false); return of(false); })
    );
  }
}

