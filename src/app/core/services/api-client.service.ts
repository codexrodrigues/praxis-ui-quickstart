import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, any>) {
    const httpParams = new HttpParams({ fromObject: params ?? {} });
    return this.http.get<T>(`${this.base}${path}`, { params: httpParams });
  }

  post<T>(path: string, body: unknown) {
    return this.http.post<T>(`${this.base}${path}`, body);
  }

  put<T>(path: string, body: unknown) {
    return this.http.put<T>(`${this.base}${path}`, body);
  }

  delete<T>(path: string) {
    return this.http.delete<T>(`${this.base}${path}`);
  }
}
