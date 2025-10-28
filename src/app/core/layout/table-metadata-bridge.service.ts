import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TableMetadataBridgeService {
  private _config$ = new BehaviorSubject<any | null>(null);
  private _resourcePath$ = new BehaviorSubject<string>('');
  private _schemasRaw$ = new BehaviorSubject<string | null>(null);
  private _resourceMeta$ = new BehaviorSubject<{ title: string; description?: string; icon?: string } | null>(null);

  readonly config$ = this._config$.asObservable();
  readonly resourcePath$ = this._resourcePath$.asObservable();
  readonly schemasRaw$ = this._schemasRaw$.asObservable();
  readonly resourceMeta$ = this._resourceMeta$.asObservable();

  setConfig(config: any): void { this._config$.next(config ?? null); }
  setResourcePath(path: string): void { this._resourcePath$.next((path || '').trim()); }
  setSchemasRaw(json: string | null): void { this._schemasRaw$.next(json); }
  setResourceMeta(meta: { title: string; description?: string; icon?: string } | null): void { this._resourceMeta$.next(meta ?? null); }
}
