import { Injectable } from '@angular/core';

export interface CrudDrawerContext {
  formId?: string;
  resourcePath?: string;
  resourceId?: string | number;
  mode?: 'create' | 'edit' | 'view';
  backConfig?: any;
  title?: string;
}

@Injectable({ providedIn: 'root' })
export class CrudDrawerBridgeService {
  private _ctx: CrudDrawerContext | null = null;
  set(ctx: CrudDrawerContext) { this._ctx = ctx; }
  get(): CrudDrawerContext | null { return this._ctx; }
  clear(): void { this._ctx = null; }
}

