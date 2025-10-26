import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TableMetadataBridgeService {
  private _config$ = new BehaviorSubject<any | null>(null);
  private _resourcePath$ = new BehaviorSubject<string>('');
  private _schemasRaw$ = new BehaviorSubject<string | null>(null);

  readonly config$ = this._config$.asObservable();
  readonly resourcePath$ = this._resourcePath$.asObservable();
  readonly schemasRaw$ = this._schemasRaw$.asObservable();

  setConfig(config: any): void { this._config$.next(config ?? null); }
  setResourcePath(path: string): void { this._resourcePath$.next((path || '').trim()); }
  setSchemasRaw(json: string | null): void { this._schemasRaw$.next(json); }
}
