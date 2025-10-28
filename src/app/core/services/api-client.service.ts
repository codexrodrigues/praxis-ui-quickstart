import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  constructor(private http: HttpClient, private baseSvc: ApiBaseService) {}

  get<T>(path: string, params?: Record<string, any>) {
    const httpParams = new HttpParams({ fromObject: params ?? {} });
    return this.http.get<T>(this.baseSvc.buildUrl(path), { params: httpParams });
  }

  post<T>(path: string, body: unknown) {
    return this.http.post<T>(this.baseSvc.buildUrl(path), body);
  }

  put<T>(path: string, body: unknown) {
    return this.http.put<T>(this.baseSvc.buildUrl(path), body);
  }

  delete<T>(path: string) {
    return this.http.delete<T>(this.baseSvc.buildUrl(path));
  }
}
